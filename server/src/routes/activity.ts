import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import { listActivity } from "../services/activity";
import { requireWorkspaceMember } from "../services/rbac";

export const activityRouter = Router();

activityRouter.use(requireSession);

activityRouter.get("/", async (req, res, next) => {
  try {
    const workspaceId = Number(req.query.workspaceId);
    if (!Number.isFinite(workspaceId)) {
      return res.status(400).json({ error: "workspaceId required" });
    }

    const projectId = req.query.projectId
      ? Number(req.query.projectId)
      : undefined;

    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const userId = (req as AuthedRequest).user.id;
    await requireWorkspaceMember(workspaceId, userId);

    const activity = await listActivity({
      workspaceId,
      projectId,
      limit,
      offset,
    });

    res.json(activity);
  } catch (err) {
    next(err);
  }
});
