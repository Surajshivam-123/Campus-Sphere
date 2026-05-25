import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { Contest } from "../models/contest.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../../utils/redis.js";
import { getIO } from "../../../socket.js";

const LANGUAGE_IDS = {
  cpp: 54, c: 50, python: 71, java: 62, javascript: 63,
};

const JUDGE0_URL = process.env.JUDGE0_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || "";

async function runOnJudge0(code, languageId, input, timeLimit, memoryLimit) {
  const headers = {
    "Content-Type": "application/json",
    ...(JUDGE0_KEY && {
      "X-RapidAPI-Key": JUDGE0_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    }),
  };

  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin: input || "",
      cpu_time_limit: timeLimit || 2,
      memory_limit: (memoryLimit || 256) * 1024,
    }),
  });

  if (!res.ok) throw new Error(`Judge0 error: ${await res.text()}`);
  return res.json();
}

const normalise = (s) => (s || "").trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");

function mapStatus(id) {
  if (id === 3)  return "accepted";
  if (id === 4)  return "wrong_answer";
  if (id === 5 || id === 14) return "time_limit_exceeded";
  if (id === 6)  return "compilation_error";
  return "runtime_error";
}

const submitCode = asyncHandler(async (req, res) => {
  const { eventId, problemId } = req.params;
  const { code, language } = req.body;

  if (!code || !language) throw new ApiError(400, "Code and language are required");

  const languageId = LANGUAGE_IDS[language];
  if (!languageId) throw new ApiError(400, `Unsupported language: ${language}`);

  const [contest, problem] = await Promise.all([
    Contest.findOne({ event: eventId }).lean(),
    Problem.findById(problemId).lean(),
  ]);

  if (!contest) throw new ApiError(404, "Contest not found");
  if (contest.status !== "live") throw new ApiError(400, "Contest is not currently live");
  if (!contest.allowedLanguages.includes(language))
    throw new ApiError(400, `Language ${language} is not allowed in this contest`);
  if (!problem) throw new ApiError(404, "Problem not found");

  const submission = await Submission.create({
    event: eventId, problem: problemId, participant: req.user._id,
    language, languageId, code, status: "running",
    totalCount: problem.testCases.length,
  });

  res.status(202).json(new ApiResponse(202, { submissionId: submission._id }, "Submission received, judging…"));

  // Background judging
  (async () => {
    try {
      const testResults = [];
      let passedCount = 0, maxTime = 0, maxMemory = 0;
      let overallStatus = "accepted", errorMessage = "";

      for (const tc of problem.testCases) {
        let result;
        try {
          result = await runOnJudge0(code, languageId, tc.input, problem.timeLimit, problem.memoryLimit);
        } catch (e) {
          overallStatus = "runtime_error";
          errorMessage = e.message;
          testResults.push({ input: tc.input, expectedOutput: tc.expectedOutput,
            actualOutput: "", status: "runtime_error", time: 0, memory: 0, isSample: tc.isSample });
          continue;
        }

        const tcStatus = mapStatus(result.status?.id);
        const actual = normalise(result.stdout || "");
        const passed = tcStatus === "accepted" && actual === normalise(tc.expectedOutput);
        const tcTime = parseFloat(result.time || 0) * 1000;
        const tcMemory = result.memory || 0;

        if (passed) passedCount++;
        else if (overallStatus === "accepted") overallStatus = tcStatus;
        if (tcTime > maxTime) maxTime = tcTime;
        if (tcMemory > maxMemory) maxMemory = tcMemory;
        if (result.compile_output) errorMessage = result.compile_output;
        else if (result.stderr && !errorMessage) errorMessage = result.stderr;

        testResults.push({
          input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: actual,
          status: passed ? "accepted" : tcStatus, time: tcTime, memory: tcMemory, isSample: tc.isSample,
        });
      }

      const score = contest.scoringMode === "binary"
        ? (passedCount === problem.testCases.length ? problem.points : 0)
        : Math.round((passedCount / Math.max(problem.testCases.length, 1)) * problem.points);

      await Submission.findByIdAndUpdate(submission._id, {
        status: overallStatus, testResults, passedCount, score,
        executionTime: Math.round(maxTime), memoryUsed: maxMemory, errorMessage,
      });

      await cacheDel(`leaderboard:${eventId}`);

      const io = getIO();
      if (io) {
        io.to(`event:${eventId}`).emit("leaderboard:updated", { eventId });
        io.to(`user:${req.user._id}`).emit("submission:result", {
          submissionId: submission._id, status: overallStatus, score,
          passedCount, totalCount: problem.testCases.length,
        });
      }
    } catch (err) {
      console.error("Judging error:", err);
      await Submission.findByIdAndUpdate(submission._id, {
        status: "runtime_error", errorMessage: err.message,
      });
    }
  })();
});

const getSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const submission = await Submission.findById(submissionId).populate("problem", "title points").lean();
  if (!submission) throw new ApiError(404, "Submission not found");

  if (submission.participant.toString() !== req.user._id.toString()) {
    submission.testResults = submission.testResults.filter((t) => t.isSample);
    delete submission.code;
  }

  res.status(200).json(new ApiResponse(200, submission, "Submission fetched"));
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const submissions = await Submission.find({ event: eventId, participant: req.user._id })
    .populate("problem", "title points difficulty")
    .sort({ createdAt: -1 })
    .lean();
  res.status(200).json(new ApiResponse(200, submissions, "Submissions fetched"));
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const cacheKey = `leaderboard:${eventId}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, "Leaderboard fetched"));

  const submissions = await Submission.find({ event: eventId, status: "accepted" })
    .populate("participant", "fullname username avatar")
    .populate("problem", "title points")
    .sort({ createdAt: 1 })
    .lean();

  const map = new Map();
  for (const sub of submissions) {
    const uid = sub.participant._id.toString();
    const pid = sub.problem._id.toString();
    if (!map.has(uid)) {
      map.set(uid, { participant: sub.participant, totalScore: 0, solvedCount: 0,
        lastAcceptedAt: sub.createdAt, solvedProblems: new Set() });
    }
    const entry = map.get(uid);
    if (!entry.solvedProblems.has(pid)) {
      entry.solvedProblems.add(pid);
      entry.totalScore += sub.score;
      entry.solvedCount += 1;
      if (sub.createdAt > entry.lastAcceptedAt) entry.lastAcceptedAt = sub.createdAt;
    }
  }

  const leaderboard = Array.from(map.values())
    .map(({ solvedProblems, ...rest }) => rest)
    .sort((a, b) => b.totalScore !== a.totalScore
      ? b.totalScore - a.totalScore
      : new Date(a.lastAcceptedAt) - new Date(b.lastAcceptedAt))
    .map((entry, i) => ({ rank: i + 1, ...entry }));

  await cacheSet(cacheKey, leaderboard, 15);
  res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard fetched"));
});

export { submitCode, getSubmission, getMySubmissions, getLeaderboard };
