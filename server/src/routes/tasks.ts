import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import { createTaskSchema, updateTaskSchema } from "../validators/tasks";
import {
  createTask,
  deleteTask,
  listTasksByBoard,
  updateTask,
} from "../services/tasks";

export const tasksRouter = Router();

tasksRouter.use(requireSession);

tasksRouter.get("/", async (req, res, next) => {
  try {
    const boardId = Number(req.query.boardId);
    if (!Number.isFinite(boardId)) {
      return res.status(400).json({ error: "boardId required" });
    }
    const userId = (req as AuthedRequest).user.id;
    const tasks = await listTasksByBoard(boardId, userId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

tasksRouter.post("/", async (req, res, next) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const task = await createTask(userId, data.columnId, {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      position: data.position,
    });
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = updateTaskSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const taskId = Number(req.params.id);
    const task = await updateTask(taskId, userId, {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      columnId: data.columnId,
      position: data.position,
      archived: data.archived,
    });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const taskId = Number(req.params.id);
    await deleteTask(taskId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
