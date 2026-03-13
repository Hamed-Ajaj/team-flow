import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import { createCommentSchema } from "../validators/comments";
import { createComment, deleteComment, listComments } from "../services/tasks";

export const commentsRouter = Router();

commentsRouter.use(requireSession);

commentsRouter.get("/", async (req, res, next) => {
  try {
    const taskId = Number(req.query.taskId);
    if (!Number.isFinite(taskId)) {
      return res.status(400).json({ error: "taskId required" });
    }
    const userId = (req as AuthedRequest).user.id;
    const comments = await listComments(taskId, userId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

commentsRouter.post("/", async (req, res, next) => {
  try {
    const data = createCommentSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const comment = await createComment(data.taskId, userId, data.body);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

commentsRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const commentId = Number(req.params.id);
    await deleteComment(commentId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
