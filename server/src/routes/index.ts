import type { Express } from "express";
import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";
import { workspacesRouter } from "./workspaces";
import { projectsRouter } from "./projects";
import { boardsRouter } from "./boards";
import { columnsRouter } from "./columns";
import { tasksRouter } from "./tasks";
import { commentsRouter } from "./comments";
import { attachmentsRouter } from "./attachments";
import { notificationsRouter } from "./notifications";
import { searchRouter } from "./search";

export const registerRoutes = (app: Express) => {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  router.get("/me", async (req, res) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    res.json(session);
  });

  router.use("/workspaces", workspacesRouter);
  router.use("/projects", projectsRouter);
  router.use("/boards", boardsRouter);
  router.use("/columns", columnsRouter);
  router.use("/tasks", tasksRouter);
  router.use("/comments", commentsRouter);
  router.use("/attachments", attachmentsRouter);
  router.use("/notifications", notificationsRouter);
  router.use("/search", searchRouter);

  app.use("/api", router);
};
