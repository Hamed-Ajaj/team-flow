import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import { searchSchema } from "../validators/search";
import { searchTasks } from "../services/tasks";

export const searchRouter = Router();

searchRouter.use(requireSession);

searchRouter.get("/", async (req, res, next) => {
  try {
    const filters = searchSchema.parse(req.query);
    const userId = (req as AuthedRequest).user.id;
    const tasks = await searchTasks(userId, filters);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});
