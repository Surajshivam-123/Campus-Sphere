import { KNOWLEDGE_BASE_CHUNKS } from "./knowledgeBase.js";
import { cacheGet, cacheSet } from "../../utils/redis.js";

// In-memory cache for embeddings to minimize external API calls
const inMemoryEmbeddingCache = new Map();

/**
 * Generate embedding vector using Gemini gemini-embedding-001
 */
export async function getEmbedding(text) {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    console.warn("GEMINI_API_KEY is not configured; skipping vector embedding");
    return null;
  }

  const cleanText = text.trim().slice(0, 4000); // safety cap
  const cacheKey = `emb:${cleanText.slice(0, 100)}:${cleanText.length}`;

  // 1. Check in-memory cache
  if (inMemoryEmbeddingCache.has(cacheKey)) {
    return inMemoryEmbeddingCache.get(cacheKey);
  }

  // 2. Check Redis / memory store
  try {
    const cached = await cacheGet(cacheKey);
    if (cached && Array.isArray(cached)) {
      inMemoryEmbeddingCache.set(cacheKey, cached);
      return cached;
    }
  } catch (err) {
    // Redis error ignore
  }

  // 3. Call Gemini Embedding API
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { parts: [{ text: cleanText }] },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Gemini embedding error:", response.status, errText);
      return null;
    }

    const data = await response.json();
    const vector = data.embedding?.values;
    if (Array.isArray(vector)) {
      inMemoryEmbeddingCache.set(cacheKey, vector);
      // Cache in Redis/fallback for 7 days
      await cacheSet(cacheKey, vector, 604800).catch(() => {});
      return vector;
    }
  } catch (error) {
    console.error("Error generating Gemini embedding:", error.message);
  }

  return null;
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Calculate lexical / keyword matching score as hybrid component or fallback
 */
function calculateKeywordScore(queryTokens, chunk) {
  const chunkText = `${chunk.title} ${chunk.category} ${chunk.keywords?.join(" ") || ""} ${chunk.content}`.toLowerCase();
  let matches = 0;
  for (const token of queryTokens) {
    if (chunkText.includes(token)) {
      matches += 1;
      // Extra weight if matches in title or explicit keywords
      if (chunk.title.toLowerCase().includes(token)) matches += 1;
      if (chunk.keywords?.some((k) => k.toLowerCase().includes(token))) matches += 1.5;
    }
  }
  return queryTokens.length > 0 ? matches / (queryTokens.length * 2.5) : 0;
}

// Cached chunk embeddings map
let chunkEmbeddings = null;
let chunkEmbeddingsPromise = null;

/**
 * Pre-index or lazily load embeddings for all knowledge base chunks concurrently
 */
export async function ensureChunkEmbeddings() {
  if (chunkEmbeddings) return chunkEmbeddings;
  if (chunkEmbeddingsPromise) return chunkEmbeddingsPromise;

  chunkEmbeddingsPromise = (async () => {
    const map = new Map();
    await Promise.all(
      KNOWLEDGE_BASE_CHUNKS.map(async (chunk) => {
        try {
          const textToEmbed = `${chunk.title} (${chunk.category}): ${chunk.content}`;
          const vector = await getEmbedding(textToEmbed);
          if (vector) {
            map.set(chunk.id, vector);
          }
        } catch (err) {
          console.warn(`[RAG] Failed to embed chunk ${chunk.id}:`, err.message);
        }
      })
    );
    chunkEmbeddings = map;
    return map;
  })();

  return chunkEmbeddingsPromise;
}

// Background pre-warming of chunk embeddings
setTimeout(() => {
  ensureChunkEmbeddings().catch((err) => {
    console.warn("[RAG] Background embedding warmup warning:", err.message);
  });
}, 100);

/**
 * Retrieve the top K relevant knowledge chunks for a given query
 */
export async function retrieveRelevantChunks(query, topK = 4) {
  if (!query || typeof query !== "string") return [];

  const queryLower = query.toLowerCase();
  const queryTokens = queryLower
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const queryVector = await getEmbedding(query);
  const chunkVectors = await ensureChunkEmbeddings().catch(() => new Map());

  const scoredChunks = KNOWLEDGE_BASE_CHUNKS.map((chunk) => {
    let vectorScore = 0;
    if (queryVector && chunkVectors.has(chunk.id)) {
      vectorScore = cosineSimilarity(queryVector, chunkVectors.get(chunk.id));
    }

    const keywordScore = calculateKeywordScore(queryTokens, chunk);

    // Hybrid score: vector similarity carries 70%, keyword score carries 30%
    const combinedScore = queryVector ? vectorScore * 0.7 + keywordScore * 0.3 : keywordScore;

    return {
      ...chunk,
      vectorScore,
      keywordScore,
      score: combinedScore,
    };
  });

  // Sort by highest score first
  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks.slice(0, topK);
}
