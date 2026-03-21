import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import { addAssignee, listAssignees, removeAssignee } from "../services/assignees";
import { z } from "zod";

const addAssigneeSchema = z.object({
  userId: z.string().min(1),
});

export const assigneesRouter = Router();

assigneesRouter.use(requireSession);

assigneesRouter.get("/:taskId/assignees", async (req, res, next) => {
  try {
    const taskId = Number(req.params.taskId);
    const userId = (req as AuthedRequest).user.id;
    const assignees = await listAssignees(taskId, userId);
    res.json(assignees);
  } catch (err) {
    next(err);
  }
});

assigneesRouter.post("/:taskId/assignees", async (req, res, next) => {
  try {
    const taskId = Number(req.params.taskId);
    const data = addAssigneeSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const assignee = await addAssignee(taskId, data.userId, userId);
    res.status(201).json(assignee);
  } catch (err) {
    next(err);
  }
});

assigneesRouter.delete(
  "/:taskId/assignees/:userId",
  async (req, res, next) => {
    try {
      const taskId = Number(req.params.taskId);
      const memberUserId = req.params.userId;
      const userId = (req as AuthedRequest).user.id;
      const assignee = await removeAssignee(taskId, memberUserId, userId);
      res.json(assignee);
    } catch (err) {
      next(err);
    }
  },
);
