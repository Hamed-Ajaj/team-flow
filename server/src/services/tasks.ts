import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  attachments,
  boards,
  comments,
  columns,
  notifications,
  projects,
  taskAssignees,
  tasks,
} from "../db/schema";
import { requireWorkspaceMember } from "./rbac";
import { logActivity } from "./activity";
import { emitBoardEvent } from "../realtime/emitter";

const getWorkspaceByColumn = async (columnId: number) => {
  const column = await db.query.columns.findFirst({
    where: (table, { eq }) => eq(table.id, columnId),
    with: { board: { with: { project: true } } },
  });
  if (!column?.board?.project) throw new Error("not_found");
  return {
    workspaceId: column.board.project.workspaceId,
    boardId: column.board.id,
    projectId: column.board.project.id,
  };
};

export const listTasksByBoard = async (boardId: number, userId: string) => {
  const board = await db.query.boards.findFirst({
    where: (table, { eq }) => eq(table.id, boardId),
    with: { project: true },
  });
  if (!board?.project) throw new Error("not_found");

  await requireWorkspaceMember(board.project.workspaceId, userId);

  return db.query.tasks.findMany({
    where: (table, { inArray }) =>
      inArray(
        table.columnId,
        db
          .select({ id: columns.id })
          .from(columns)
          .where(eq(columns.boardId, boardId)),
      ),
    orderBy: (table, { asc }) => [asc(table.position)],
    with: {
      assignees: true,
      comments: true,
      attachments: true,
    },
  });
};

export const createTask = async (
  userId: string,
  columnId: number,
  data: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    dueDate?: Date | null;
    position?: number;
  },
) => {
  const { workspaceId, boardId, projectId } = await getWorkspaceByColumn(
    columnId,
  );
  await requireWorkspaceMember(workspaceId, userId);

  const [max] = await db
    .select({ value: sql<number>`max(${tasks.position})` })
    .from(tasks)
    .where(eq(tasks.columnId, columnId));

  const position = data.position ?? (max?.value ?? -1) + 1;

  const [task] = await db
    .insert(tasks)
    .values({
      columnId,
      title: data.title,
      description: data.description,
      priority: data.priority ?? "medium",
      dueDate: data.dueDate,
      position,
      createdByUserId: userId,
    })
    .returning();

  await logActivity({
    workspaceId,
    projectId,
    actorUserId: userId,
    entityType: "task",
    entityId: String(task.id),
    action: "created",
    meta: { title: task.title, boardId },
  });

  emitBoardEvent(boardId, "task:created", { task });

  return task;
};

export const updateTask = async (
  taskId: number,
  userId: string,
  data: {
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    dueDate?: Date | null;
    columnId?: number;
    position?: number;
    archived?: boolean;
  },
) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });

  if (!task?.column?.board?.project) throw new Error("not_found");
  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);

  const [updated] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  if (updated) {
    await logActivity({
      workspaceId: task.column.board.project.workspaceId,
      projectId: task.column.board.project.id,
      actorUserId: userId,
      entityType: "task",
      entityId: String(taskId),
      action: "updated",
      meta: { title: updated.title, boardId: task.column.boardId },
    });

    emitBoardEvent(task.column.boardId, "task:updated", { task: updated });
  }

  return updated;
};

export const deleteTask = async (taskId: number, userId: string) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });
  if (!task?.column?.board?.project) return;

  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);
  await logActivity({
    workspaceId: task.column.board.project.workspaceId,
    projectId: task.column.board.project.id,
    actorUserId: userId,
    entityType: "task",
    entityId: String(taskId),
    action: "deleted",
    meta: { boardId: task.column.boardId },
  });
  emitBoardEvent(task.column.boardId, "task:deleted", { taskId });
  await db.delete(tasks).where(eq(tasks.id, taskId));
};

export const listComments = async (taskId: number, userId: string) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });
  if (!task?.column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);
  return db.query.comments.findMany({
    where: (table, { eq }) => eq(table.taskId, taskId),
    orderBy: (table, { asc }) => [asc(table.createdAt)],
  });
};

export const createComment = async (
  taskId: number,
  userId: string,
  body: string,
) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });
  if (!task?.column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);

  const [comment] = await db
    .insert(comments)
    .values({ taskId, authorUserId: userId, body })
    .returning();

  const assignees = await db.query.taskAssignees.findMany({
    where: (table, { eq }) => eq(table.taskId, taskId),
  });

  if (assignees.length > 0) {
    await db.insert(notifications).values(
      assignees
        .filter((assignee) => assignee.userId !== userId)
        .map((assignee) => ({
          userId: assignee.userId,
          type: "comment",
          payload: {
            taskId,
            commentId: comment.id,
          },
        })),
    );
  }

  await logActivity({
    workspaceId: task.column.board.project.workspaceId,
    projectId: task.column.board.project.id,
    actorUserId: userId,
    entityType: "comment",
    entityId: String(comment.id),
    action: "created",
    meta: { taskId, boardId: task.column.boardId },
  });

  emitBoardEvent(task.column.boardId, "comment:created", { comment });

  return comment;
};

export const deleteComment = async (
  commentId: number,
  userId: string,
) => {
  const comment = await db.query.comments.findFirst({
    where: (table, { eq }) => eq(table.id, commentId),
    with: { task: { with: { column: { with: { board: { with: { project: true } } } } } } },
  });
  if (!comment?.task?.column?.board?.project) return;

  await requireWorkspaceMember(comment.task.column.board.project.workspaceId, userId);
  await logActivity({
    workspaceId: comment.task.column.board.project.workspaceId,
    projectId: comment.task.column.board.project.id,
    actorUserId: userId,
    entityType: "comment",
    entityId: String(commentId),
    action: "deleted",
    meta: { taskId: comment.taskId, boardId: comment.task.column.boardId },
  });
  await db.delete(comments).where(eq(comments.id, commentId));
};

export const attachFileRecord = async (
  taskId: number,
  userId: string,
  values: {
    bucket: string;
    storageKey: string;
    originalName: string;
    contentType: string;
    sizeBytes: number;
  },
) => {
  const task = await db.query.tasks.findFirst({
    where: (table, { eq }) => eq(table.id, taskId),
    with: { column: { with: { board: { with: { project: true } } } } },
  });
  if (!task?.column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(task.column.board.project.workspaceId, userId);

  const [attachment] = await db
    .insert(attachments)
    .values({
      taskId,
      uploaderUserId: userId,
      ...values,
    })
    .returning();

  await logActivity({
    workspaceId: task.column.board.project.workspaceId,
    projectId: task.column.board.project.id,
    actorUserId: userId,
    entityType: "attachment",
    entityId: String(attachment.id),
    action: "created",
    meta: { taskId, boardId: task.column.boardId },
  });

  emitBoardEvent(task.column.boardId, "attachment:created", { attachment });

  return attachment;
};

export const searchTasks = async (
  userId: string,
  filters: {
    workspaceId?: number;
    projectId?: number;
    boardId?: number;
    q?: string;
    assigneeId?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    archived?: boolean;
  },
) => {
  if (!filters.workspaceId && !filters.projectId && !filters.boardId) {
    throw new Error("missing_scope");
  }

  let workspaceId = filters.workspaceId;
  if (!workspaceId && filters.projectId) {
    const project = await db.query.projects.findFirst({
      where: (table, { eq }) => eq(table.id, filters.projectId!),
    });
    if (!project) throw new Error("not_found");
    workspaceId = project.workspaceId;
  }

  if (!workspaceId && filters.boardId) {
    const board = await db.query.boards.findFirst({
      where: (table, { eq }) => eq(table.id, filters.boardId!),
      with: { project: true },
    });
    if (!board?.project) throw new Error("not_found");
    workspaceId = board.project.workspaceId;
  }

  if (workspaceId) {
    await requireWorkspaceMember(workspaceId, userId);
  }

  const whereClauses = [];
  if (filters.q) {
    whereClauses.push(
      or(
        ilike(tasks.title, `%${filters.q}%`),
        ilike(tasks.description, `%${filters.q}%`),
      ),
    );
  }
  if (filters.priority) whereClauses.push(eq(tasks.priority, filters.priority));
  if (filters.archived !== undefined)
    whereClauses.push(eq(tasks.archived, filters.archived));
  if (filters.boardId) whereClauses.push(eq(boards.id, filters.boardId));
  if (filters.projectId) whereClauses.push(eq(projects.id, filters.projectId));
  if (workspaceId) whereClauses.push(eq(projects.workspaceId, workspaceId));

  if (filters.assigneeId) {
    whereClauses.push(
      inArray(
        tasks.id,
        db
          .select({ id: taskAssignees.taskId })
          .from(taskAssignees)
          .where(eq(taskAssignees.userId, filters.assigneeId)),
      ),
    );
  }

  const results = await db
    .select({ task: tasks })
    .from(tasks)
    .innerJoin(columns, eq(tasks.columnId, columns.id))
    .innerJoin(boards, eq(columns.boardId, boards.id))
    .innerJoin(projects, eq(boards.projectId, projects.id))
    .where(and(...whereClauses));

  return results.map((row) => row.task);
};
