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

    const entityType =
      typeof req.query.entityType === "string" ? req.query.entityType : undefined;
    const actorUserId =
      typeof req.query.actorUserId === "string" ? req.query.actorUserId : undefined;

    const limitRaw = req.query.limit ? Number(req.query.limit) : undefined;
    const offsetRaw = req.query.offset ? Number(req.query.offset) : undefined;
    const limit = Number.isFinite(limitRaw) ? Math.min(200, Math.max(1, limitRaw)) : undefined;
    const offset = Number.isFinite(offsetRaw) ? Math.max(0, offsetRaw) : undefined;

    const userId = (req as AuthedRequest).user.id;
    await requireWorkspaceMember(workspaceId, userId);

    const activity = await listActivity({
      workspaceId,
      projectId,
      entityType,
      actorUserId,
      limit,
      offset,
    });

    res.json(activity);
  } catch (err) {
    next(err);
  }
});
