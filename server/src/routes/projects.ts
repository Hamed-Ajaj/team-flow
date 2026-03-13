import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/projects";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from "../services/projects";

export const projectsRouter = Router();

projectsRouter.use(requireSession);

projectsRouter.get("/", async (req, res, next) => {
  try {
    const workspaceId = Number(req.query.workspaceId);
    if (!Number.isFinite(workspaceId)) {
      return res.status(400).json({ error: "workspaceId required" });
    }
    const userId = (req as AuthedRequest).user.id;
    const projects = await listProjects(workspaceId, userId);
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const project = await createProject(
      userId,
      data.workspaceId,
      data.name,
      data.description,
    );
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const projectId = Number(req.params.id);
    const project = await updateProject(projectId, userId, data);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.delete("/:id", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const projectId = Number(req.params.id);
    await deleteProject(projectId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
