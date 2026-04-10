import asyncHandler from "../../../utils/AsyncHandler.js";
import ApiResponse from "../../../utils/ApiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import { Problem } from "../models/problem.model.js";
import { cacheGet, cacheSet, cacheDel } from "../../../utils/redis.js";

const PROBLEM_TTL = 120;

// Strip hidden test cases for participants — shared by getProblems + getProblem
const stripHidden = (p) => ({ ...p, testCases: p.testCases.filter((tc) => tc.isSample) });

const createProblem = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { title, description, inputFormat, outputFormat, constraints,
          difficulty, points, timeLimit, memoryLimit, testCases, order } = req.body;

  if (!title || !description) throw new ApiError(400, "Title and description are required");

  const problem = await Problem.create({
    event: eventId, title, description, inputFormat, outputFormat,
    constraints, difficulty, points, timeLimit, memoryLimit,
    testCases: testCases || [], order: order ?? 0, createdBy: req.user._id,
  });

  await cacheDel(`problems:event:${eventId}:full`, `problems:event:${eventId}:public`);
  res.status(201).json(new ApiResponse(201, problem, "Problem created"));
});

const updateProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  const problem = await Problem.findByIdAndUpdate(problemId, req.body, { new: true });
  if (!problem) throw new ApiError(404, "Problem not found");

  await cacheDel(
    `problems:event:${problem.event}:full`,
    `problems:event:${problem.event}:public`,
    `problem:${problemId}:full`,
    `problem:${problemId}:public`
  );
  res.status(200).json(new ApiResponse(200, problem, "Problem updated"));
});

const deleteProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  const problem = await Problem.findByIdAndDelete(problemId);
  if (!problem) throw new ApiError(404, "Problem not found");

  await cacheDel(
    `problems:event:${problem.event}:full`,
    `problems:event:${problem.event}:public`,
    `problem:${problemId}:full`,
    `problem:${problemId}:public`
  );
  res.status(200).json(new ApiResponse(200, {}, "Problem deleted"));
});

const getProblems = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const isOrganizer = req.query.organizer === "true";
  const cacheKey = `problems:event:${eventId}:${isOrganizer ? "full" : "public"}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, "Problems fetched"));

  const problems = await Problem.find({ event: eventId }).sort({ order: 1, createdAt: 1 }).lean();
  const result = isOrganizer ? problems : problems.map(stripHidden);

  await cacheSet(cacheKey, result, PROBLEM_TTL);
  res.status(200).json(new ApiResponse(200, result, "Problems fetched"));
});

const getProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const isOrganizer = req.query.organizer === "true";
  const cacheKey = `problem:${problemId}:${isOrganizer ? "full" : "public"}`;

  const cached = await cacheGet(cacheKey);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, "Problem fetched"));

  const problem = await Problem.findById(problemId).lean();
  if (!problem) throw new ApiError(404, "Problem not found");

  const result = isOrganizer ? problem : stripHidden(problem);
  await cacheSet(cacheKey, result, PROBLEM_TTL);
  res.status(200).json(new ApiResponse(200, result, "Problem fetched"));
});

export { createProblem, updateProblem, deleteProblem, getProblems, getProblem };
