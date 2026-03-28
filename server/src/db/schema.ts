import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamptz = (name: string) =>
  timestamp(name, { withTimezone: true }).defaultNow().notNull();

export const workspaceRole = pgEnum("workspace_role", [
  "owner",
  "admin",
  "member",
]);

export const taskPriority = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const workspaces = pgTable(
  "workspaces",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (table) => ({
    slugUnique: uniqueIndex("workspaces_slug_unique").on(table.slug),
    createdByIdx: index("workspaces_created_by_user_id_idx").on(
      table.createdByUserId,
    ),
  }),
);

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    workspaceId: bigint("workspace_id", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: workspaceRole("role").notNull().default("member"),
    joinedAt: timestamptz("joined_at"),
  },
  (table) => ({
    workspaceIdx: index("workspace_members_workspace_id_idx").on(
      table.workspaceId,
    ),
    userIdx: index("workspace_members_user_id_idx").on(table.userId),
    workspaceUserUnique: uniqueIndex(
      "workspace_members_workspace_id_user_id_unique",
    ).on(table.workspaceId, table.userId),
  }),
);

export const projects = pgTable(
  "projects",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    workspaceId: bigint("workspace_id", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (table) => ({
    workspaceIdx: index("projects_workspace_id_idx").on(table.workspaceId),
    createdByIdx: index("projects_created_by_user_id_idx").on(
      table.createdByUserId,
    ),
  }),
);

export const boards = pgTable(
  "boards",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    projectId: bigint("project_id", { mode: "number" })
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (table) => ({
    projectIdx: index("boards_project_id_idx").on(table.projectId),
  }),
);

export const columns = pgTable(
  "columns",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    boardId: bigint("board_id", { mode: "number" })
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (table) => ({
    boardIdx: index("columns_board_id_idx").on(table.boardId),
    boardPositionUnique: uniqueIndex(
      "columns_board_id_position_unique",
    ).on(table.boardId, table.position),
  }),
);

export const tasks = pgTable(
  "tasks",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    columnId: bigint("column_id", { mode: "number" })
      .notNull()
      .references(() => columns.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    priority: taskPriority("priority").notNull().default("medium"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    position: integer("position").notNull(),
    createdByUserId: text("created_by_user_id").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
    archived: boolean("archived").notNull().default(false),
  },
  (table) => ({
    columnIdx: index("tasks_column_id_idx").on(table.columnId),
    columnPositionUnique: uniqueIndex("tasks_column_id_position_unique").on(
      table.columnId,
      table.position,
    ),
    priorityIdx: index("tasks_priority_idx").on(table.priority),
    dueDateIdx: index("tasks_due_date_idx").on(table.dueDate),
  }),
);

export const taskAssignees = pgTable(
  "task_assignees",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    taskId: bigint("task_id", { mode: "number" })
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    assignedAt: timestamptz("assigned_at"),
  },
  (table) => ({
    taskIdx: index("task_assignees_task_id_idx").on(table.taskId),
    userIdx: index("task_assignees_user_id_idx").on(table.userId),
    taskUserUnique: uniqueIndex("task_assignees_task_id_user_id_unique").on(
      table.taskId,
      table.userId,
    ),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    taskId: bigint("task_id", { mode: "number" })
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamptz("created_at"),
    updatedAt: timestamptz("updated_at"),
  },
  (table) => ({
    taskIdx: index("comments_task_id_idx").on(table.taskId),
    authorIdx: index("comments_author_user_id_idx").on(table.authorUserId),
  }),
);

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    workspaceId: bigint("workspace_id", { mode: "number" })
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    projectId: bigint("project_id", { mode: "number" }).references(
      () => projects.id,
      { onDelete: "set null" },
    ),
    actorUserId: text("actor_user_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    meta: jsonb("meta"),
    createdAt: timestamptz("created_at"),
  },
  (table) => ({
    workspaceIdx: index("activity_logs_workspace_id_idx").on(table.workspaceId),
    projectIdx: index("activity_logs_project_id_idx").on(table.projectId),
    actorIdx: index("activity_logs_actor_user_id_idx").on(table.actorUserId),
  }),
);

export const attachments = pgTable(
  "attachments",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    taskId: bigint("task_id", { mode: "number" })
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    uploaderUserId: text("uploader_user_id").notNull(),
    bucket: text("bucket").notNull(),
    storageKey: text("storage_key").notNull(),
    originalName: text("original_name").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    createdAt: timestamptz("created_at"),
  },
  (table) => ({
    taskIdx: index("attachments_task_id_idx").on(table.taskId),
    uploaderIdx: index("attachments_uploader_user_id_idx").on(
      table.uploaderUserId,
    ),
    storageKeyUnique: uniqueIndex("attachments_storage_key_unique").on(
      table.storageKey,
    ),
  }),
);

export const notifications = pgTable(
  "notifications",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamptz("created_at"),
  },
  (table) => ({
    userIdx: index("notifications_user_id_idx").on(table.userId),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  }),
);

export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  projects: many(projects),
  activityLogs: many(activityLogs),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
  }),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  boards: many(boards),
  activityLogs: many(activityLogs),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  project: one(projects, {
    fields: [boards.projectId],
    references: [projects.id],
  }),
  columns: many(columns),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
  assignees: many(taskAssignees),
  comments: many(comments),
  attachments: many(attachments),
}));

export const taskAssigneesRelations = relations(
  taskAssignees,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskAssignees.taskId],
      references: [tasks.id],
    }),
  }),
);

export const commentsRelations = relations(comments, ({ one }) => ({
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [activityLogs.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [activityLogs.projectId],
    references: [projects.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({}) => ({}));

export * from "./auth-schema";
