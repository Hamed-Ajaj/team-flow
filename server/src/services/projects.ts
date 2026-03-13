import { eq } from "drizzle-orm";
import { db } from "../db";
import { boards, projects } from "../db/schema";
import { requireWorkspaceMember } from "./rbac";

export const listProjects = async (workspaceId: number, userId: string) => {
  await requireWorkspaceMember(workspaceId, userId);
  return db.query.projects.findMany({
    where: (table, { eq }) => eq(table.workspaceId, workspaceId),
  });
};

export const createProject = async (
  userId: string,
  workspaceId: number,
  name: string,
  description?: string,
) => {
  await requireWorkspaceMember(workspaceId, userId);

  const [project] = await db
    .insert(projects)
    .values({
      workspaceId,
      name,
      description,
      createdByUserId: userId,
    })
    .returning();

  await db.insert(boards).values({
    projectId: project.id,
    name: `${project.name} Board`,
    createdByUserId: userId,
  });

  return project;
};

export const updateProject = async (
  projectId: number,
  userId: string,
  data: { name?: string; description?: string },
) => {
  const project = await db.query.projects.findFirst({
    where: (table, { eq }) => eq(table.id, projectId),
  });
  if (!project) throw new Error("not_found");

  await requireWorkspaceMember(project.workspaceId, userId);

  const [updated] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
};

export const deleteProject = async (projectId: number, userId: string) => {
  const project = await db.query.projects.findFirst({
    where: (table, { eq }) => eq(table.id, projectId),
  });
  if (!project) return;

  await requireWorkspaceMember(project.workspaceId, userId);
  await db.delete(projects).where(eq(projects.id, projectId));
};
