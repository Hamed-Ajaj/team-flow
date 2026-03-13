import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import { createBoardSchema, updateBoardSchema } from "../validators/boards";
import {
  createBoard,
  deleteBoard,
  listBoards,
  updateBoard,
} from "../services/boards";

export const boardsRouter = Router();

boardsRouter.use(requireSession);

boardsRouter.get("/", async (req, res, next) => {
  try {
    const projectId = Number(req.query.projectId);
    if (!Number.isFinite(projectId)) {
      return res.status(400).json({ error: "projectId required" });
    }
    const userId = (req as AuthedRequest).user.id;
    const boards = await listBoards(projectId, userId);
    res.json(boards);
  } catch (err) {
    next(err);
  }
});

boardsRouter.post("/", async (req, res, next) => {
  try {
    const data = createBoardSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const board = await createBoard(data.projectId, userId, data.name);
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
});

boardsRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = updateBoardSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const boardId = Number(req.params.id);
    const board = await updateBoard(boardId, userId, data);
    res.json(board);
  } catch (err) {
    next(err);
  }
});

boardsRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const boardId = Number(req.params.id);
    await deleteBoard(boardId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
