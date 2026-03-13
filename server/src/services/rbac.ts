import { db } from "../db";
import { workspaceMembers, workspaceRole } from "../db/schema";

export const requireWorkspaceRole = async (
  workspaceId: number,
  userId: string,
  roles: (typeof workspaceRole.enumValues)[number][],
) => {
  const membership = await db.query.workspaceMembers.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.workspaceId, workspaceId), eq(table.userId, userId)),
  });

  if (!membership || !roles.includes(membership.role)) {
    const error = new Error("forbidden");
    (error as { status?: number }).status = 403;
    throw error;
  }

  return membership;
};

export const requireWorkspaceMember = async (
  workspaceId: number,
  userId: string,
) => {
  const membership = await db.query.workspaceMembers.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.workspaceId, workspaceId), eq(table.userId, userId)),
  });

  if (!membership) {
    const error = new Error("forbidden");
    (error as { status?: number }).status = 403;
    throw error;
  }

  return membership;
};
