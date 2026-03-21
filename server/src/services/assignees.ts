import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { taskAssignees, tasks } from "../db/schema";
import { requireWorkspaceMember } from "./rbac";
import { logActivity } from "./activity";
import { emitBoardEvent } from "../realtime/emitter";

export const listAssignees = async (taskId: number, userId: string) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });
  if (!task?.column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);

  return db.query.taskAssignees.findMany({
    where: (table, { eq }) => eq(table.taskId, taskId),
  });
};

export const addAssignee = async (
  taskId: number,
  memberUserId: string,
  userId: string,
) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });
  if (!task?.column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);

  const [assignee] = await db
    .insert(taskAssignees)
    .values({ taskId, userId: memberUserId })
    .onConflictDoNothing()
    .returning();

  if (assignee) {
    await logActivity({
      workspaceId: task.column.board.project.workspaceId,
      projectId: task.column.board.project.id,
      actorUserId: userId,
      entityType: "assignee",
      entityId: String(assignee.id),
      action: "added",
      meta: { taskId, assigneeUserId: memberUserId },
    });

    emitBoardEvent(task.column.boardId, "task:assignee_added", {
      taskId,
      assignee,
    });
  }

  return assignee;
};

export const removeAssignee = async (
  taskId: number,
  memberUserId: string,
  userId: string,
) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });
  if (!task?.column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);

  const [assignee] = await db
    .delete(taskAssignees)
    .where(
      and(
        eq(taskAssignees.taskId, taskId),
        eq(taskAssignees.userId, memberUserId),
      ),
    )
    .returning();

  if (assignee) {
    await logActivity({
      workspaceId: task.column.board.project.workspaceId,
      projectId: task.column.board.project.id,
      actorUserId: userId,
      entityType: "assignee",
      entityId: String(assignee.id),
      action: "removed",
      meta: { taskId, assigneeUserId: memberUserId },
    });

    emitBoardEvent(task.column.boardId, "task:assignee_removed", {
      taskId,
      assignee,
    });
  }

  return assignee;
};
