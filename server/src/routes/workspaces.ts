import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import {
  addMemberSchema,
  createWorkspaceSchema,
  updateMemberRoleSchema,
  updateWorkspaceSchema,
} from "../validators/workspaces";
import {
  addMember,
  createWorkspace,
  deleteWorkspace,
  listMembers,
  listWorkspacesForUser,
  removeMember,
  updateMemberRole,
  updateWorkspace,
} from "../services/workspaces";

export const workspacesRouter = Router();

workspacesRouter.use(requireSession);

workspacesRouter.get("/", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const workspaces = await listWorkspacesForUser(userId);
    res.json(workspaces);
  } catch (err) {
    next(err);
  }
});

workspacesRouter.post("/", async (req, res, next) => {
  try {
    const data = createWorkspaceSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const workspace = await createWorkspace(userId, data.name, data.slug);
    res.status(201).json(workspace);
  } catch (err) {
    next(err);
  }
});

workspacesRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = updateWorkspaceSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const workspaceId = Number(req.params.id);
    const workspace = await updateWorkspace(workspaceId, userId, data);
    res.json(workspace);
  } catch (err) {
    next(err);
  }
});

workspacesRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const workspaceId = Number(req.params.id);
    await deleteWorkspace(workspaceId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

workspacesRouter.get("/:id/members", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const workspaceId = Number(req.params.id);
    const members = await listMembers(workspaceId, userId);
    res.json(members);
  } catch (err) {
    next(err);
  }
});

workspacesRouter.post("/:id/members", async (req, res, next) => {
  try {
    const data = addMemberSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const workspaceId = Number(req.params.id);
    const member = await addMember(
      workspaceId,
      userId,
      data.userId,
      data.role ?? "member",
    );
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
});

workspacesRouter.patch("/:id/members/:memberId", async (req, res, next) => {
  try {
    const data = updateMemberRoleSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const workspaceId = Number(req.params.id);
    const member = await updateMemberRole(
      workspaceId,
      userId,
      req.params.memberId,
      data.role,
    );
    res.json(member);
  } catch (err) {
    next(err);
  }
});

workspacesRouter.delete("/:id/members/:memberId", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const workspaceId = Number(req.params.id);
    const memberUserId = req.params.memberId;
    const member = await removeMember(workspaceId, userId, memberUserId);
    res.json(member);
  } catch (err) {
    next(err);
  }
});
