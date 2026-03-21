import { eq } from "drizzle-orm";
import { db } from "../db";
import { activityLogs } from "../db/schema";

export const logActivity = async (input: {
  workspaceId: number;
  projectId?: number | null;
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  meta?: Record<string, unknown> | null;
}) => {
  const [log] = await db
    .insert(activityLogs)
    .values({
      workspaceId: input.workspaceId,
      projectId: input.projectId ?? null,
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      meta: input.meta ?? null,
    })
    .returning();

  return log;
};

export const listActivity = async (filters: {
  workspaceId: number;
  projectId?: number;
  limit?: number;
  offset?: number;
}) => {
  const conditions = [eq(activityLogs.workspaceId, filters.workspaceId)];
  if (filters.projectId) {
    conditions.push(eq(activityLogs.projectId, filters.projectId));
  }

  return db.query.activityLogs.findMany({
    where: (table, { and }) => and(...conditions),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: filters.limit ?? 50,
    offset: filters.offset ?? 0,
  });
};
