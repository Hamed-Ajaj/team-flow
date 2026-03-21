import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { boards, columns } from "../db/schema";
import { requireWorkspaceMember } from "./rbac";
import { logActivity } from "./activity";
import { emitBoardEvent } from "../realtime/emitter";

export const listBoards = async (projectId: number, userId: string) => {
  const project = await db.query.projects.findFirst({
    where: (table, { eq }) => eq(table.id, projectId),
  });
  if (!project) throw new Error("not_found");

  await requireWorkspaceMember(project.workspaceId, userId);

  return db.query.boards.findMany({
    where: (table, { eq }) => eq(table.projectId, projectId),
  });
};

export const createBoard = async (
  projectId: number,
  userId: string,
  name: string,
) => {
  const project = await db.query.projects.findFirst({
    where: (table, { eq }) => eq(table.id, projectId),
  });
  if (!project) throw new Error("not_found");

  await requireWorkspaceMember(project.workspaceId, userId);

  const [board] = await db
    .insert(boards)
    .values({ projectId, name, createdByUserId: userId })
    .returning();

  await db.insert(columns).values([
    { boardId: board.id, name: "To Do", position: 0, createdByUserId: userId },
    {
      boardId: board.id,
      name: "In Progress",
      position: 1,
      createdByUserId: userId,
    },
    { boardId: board.id, name: "Done", position: 2, createdByUserId: userId },
  ]);

  await logActivity({
    workspaceId: project.workspaceId,
    projectId: project.id,
    actorUserId: userId,
    entityType: "board",
    entityId: String(board.id),
    action: "created",
    meta: { name: board.name },
  });

  emitBoardEvent(board.id, "board:created", { board });

  return board;
};

export const updateBoard = async (
  boardId: number,
  userId: string,
  data: { name?: string },
) => {
  const board = await db.query.boards.findFirst({
    where: (table, { eq }) => eq(table.id, boardId),
    with: { project: true },
  });
  if (!board?.project) throw new Error("not_found");

  await requireWorkspaceMember(board.project.workspaceId, userId);

  const [updated] = await db
    .update(boards)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(boards.id, boardId))
    .returning();

  if (updated) {
    await logActivity({
      workspaceId: board.project.workspaceId,
      projectId: board.project.id,
      actorUserId: userId,
      entityType: "board",
      entityId: String(boardId),
      action: "updated",
      meta: { name: updated.name },
    });
    emitBoardEvent(boardId, "board:updated", { board: updated });
  }

  return updated;
};

export const deleteBoard = async (boardId: number, userId: string) => {
  const board = await db.query.boards.findFirst({
    where: (table, { eq }) => eq(table.id, boardId),
    with: { project: true },
  });
  if (!board?.project) return;

  await requireWorkspaceMember(board.project.workspaceId, userId);
  await logActivity({
    workspaceId: board.project.workspaceId,
    projectId: board.project.id,
    actorUserId: userId,
    entityType: "board",
    entityId: String(boardId),
    action: "deleted",
  });
  emitBoardEvent(boardId, "board:deleted", { boardId });
  await db.delete(boards).where(eq(boards.id, boardId));
};

export const listColumns = async (boardId: number, userId: string) => {
  const board = await db.query.boards.findFirst({
    where: (table, { eq }) => eq(table.id, boardId),
    with: { project: true },
  });
  if (!board?.project) throw new Error("not_found");

  await requireWorkspaceMember(board.project.workspaceId, userId);

  return db.query.columns.findMany({
    where: (table, { eq }) => eq(table.boardId, boardId),
    orderBy: (table, { asc }) => [asc(table.position)],
  });
};

export const createColumn = async (
  boardId: number,
  userId: string,
  name: string,
  position?: number,
) => {
  const board = await db.query.boards.findFirst({
    where: (table, { eq }) => eq(table.id, boardId),
    with: { project: true },
  });
  if (!board?.project) throw new Error("not_found");

  await requireWorkspaceMember(board.project.workspaceId, userId);

  const [max] = await db
    .select({ value: sql<number>`max(${columns.position})` })
    .from(columns)
    .where(eq(columns.boardId, boardId));

  const columnPosition = position ?? (max?.value ?? -1) + 1;

  const [column] = await db
    .insert(columns)
    .values({
      boardId,
      name,
      position: columnPosition,
      createdByUserId: userId,
    })
    .returning();

  await logActivity({
    workspaceId: board.project.workspaceId,
    projectId: board.project.id,
    actorUserId: userId,
    entityType: "column",
    entityId: String(column.id),
    action: "created",
    meta: { name: column.name, boardId },
  });

  emitBoardEvent(boardId, "column:created", { column });

  return column;
};

export const updateColumn = async (
  columnId: number,
  userId: string,
  data: { name?: string; position?: number },
) => {
  const column = await db.query.columns.findFirst({
    where: (table, { eq }) => eq(table.id, columnId),
    with: { board: { with: { project: true } } },
  });
  if (!column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(column.board.project.workspaceId, userId);

  const [updated] = await db
    .update(columns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(columns.id, columnId))
    .returning();

  if (updated) {
    await logActivity({
      workspaceId: column.board.project.workspaceId,
      projectId: column.board.project.id,
      actorUserId: userId,
      entityType: "column",
      entityId: String(columnId),
      action: "updated",
      meta: { name: updated.name, boardId: column.boardId },
    });
    emitBoardEvent(column.boardId, "column:updated", { column: updated });
  }

  return updated;
};

export const deleteColumn = async (columnId: number, userId: string) => {
  const column = await db.query.columns.findFirst({
    where: (table, { eq }) => eq(table.id, columnId),
    with: { board: { with: { project: true } } },
  });
  if (!column?.board?.project) return;

  await requireWorkspaceMember(column.board.project.workspaceId, userId);
  await logActivity({
    workspaceId: column.board.project.workspaceId,
    projectId: column.board.project.id,
    actorUserId: userId,
    entityType: "column",
    entityId: String(columnId),
    action: "deleted",
    meta: { boardId: column.boardId },
  });
  emitBoardEvent(column.boardId, "column:deleted", { columnId });
  await db.delete(columns).where(eq(columns.id, columnId));
};
