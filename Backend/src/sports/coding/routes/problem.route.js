import Router from "express";
import {
  createProblem, updateProblem, deleteProblem, getProblems, getProblem,
} from "../controllers/problem.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { verifyEventAccess, verifyEventOrganizer } from "../../../middlewares/eventAccess.middleware.js";

const problemRouter = Router();

// Event-scoped
problemRouter.get("/event/:eventId",    verifyJWT, verifyEventAccess, getProblems);
problemRouter.post("/event/:eventId",   verifyJWT, verifyEventOrganizer, createProblem);

// Problem-scoped
problemRouter.get("/:problemId",        verifyJWT, verifyEventAccess, getProblem);
problemRouter.patch("/:problemId",      verifyJWT, verifyEventOrganizer, updateProblem);
problemRouter.delete("/:problemId",     verifyJWT, verifyEventOrganizer, deleteProblem);

export default problemRouter;
