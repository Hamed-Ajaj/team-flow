export type WorkspaceRole = "owner" | "admin" | "member";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Workspace = {
  id: number;
  name: string;
  slug: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMember = {
  id: number;
  workspaceId: number;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
};

export type Project = {
  id: number;
  workspaceId: number;
  name: string;
  description?: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type Board = {
  id: number;
  projectId: number;
  name: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: number;
  boardId: number;
  name: string;
  position: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskAssignee = {
  id: number;
  taskId: number;
  userId: string;
  assignedAt: string;
};

export type Comment = {
  id: number;
  taskId: number;
  authorUserId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type Attachment = {
  id: number;
  taskId: number;
  uploaderUserId: string;
  bucket: string;
  storageKey: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

export type Task = {
  id: number;
  columnId: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;
  position: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  assignees?: TaskAssignee[];
  comments?: Comment[];
  attachments?: Attachment[];
};

export type Notification = {
  id: number;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
};

export type SessionResponse = {
  session: Record<string, unknown> | null;
  user: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
};
