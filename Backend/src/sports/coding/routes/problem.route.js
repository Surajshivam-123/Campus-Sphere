import Router from "express";
import {
  createProblem, updateProblem, deleteProblem, getProblems, getProblem,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { verifyEventAccess } from "../../../middlewares/eventAccess.middleware.js";

const problemRouter = Router();

// Event-scoped
problemRouter.get("/event/:eventId",    verifyJWT, verifyEventAccess, getProblems);
problemRouter.post("/event/:eventId",   verifyJWT, createProblem);

// Problem-scoped
problemRouter.get("/:problemId",        verifyJWT, getProblem);
problemRouter.patch("/:problemId",      verifyJWT, updateProblem);
problemRouter.delete("/:problemId",     verifyJWT, deleteProblem);

export default problemRouter;
