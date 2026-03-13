import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import {
  createColumnSchema,
  updateColumnSchema,
} from "../validators/columns";
import {
  createColumn,
  deleteColumn,
  listColumns,
  updateColumn,
} from "../services/boards";

export const columnsRouter = Router();

columnsRouter.use(requireSession);

columnsRouter.get("/", async (req, res, next) => {
  try {
    const boardId = Number(req.query.boardId);
    if (!Number.isFinite(boardId)) {
      return res.status(400).json({ error: "boardId required" });
    }
    const userId = (req as AuthedRequest).user.id;
    const columns = await listColumns(boardId, userId);
    res.json(columns);
  } catch (err) {
    next(err);
  }
});

columnsRouter.post("/", async (req, res, next) => {
  try {
    const data = createColumnSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const column = await createColumn(
      data.boardId,
      userId,
      data.name,
      data.position,
    );
    res.status(201).json(column);
  } catch (err) {
    next(err);
  }
});

columnsRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = updateColumnSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const columnId = Number(req.params.id);
    const column = await updateColumn(columnId, userId, data);
    res.json(column);
  } catch (err) {
    next(err);
  }
});

columnsRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const columnId = Number(req.params.id);
    await deleteColumn(columnId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
