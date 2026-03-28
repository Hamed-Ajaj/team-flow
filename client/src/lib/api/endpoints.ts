import { apiRequest } from "@/lib/api/client";
import type {
  Attachment,
  Board,
  Column,
  Comment,
  Notification,
  Project,
  Task,
  TaskAssignee,
  Workspace,
  WorkspaceMember,
} from "@/types/api";

export const api = {
  me: () => apiRequest<{ userId: string }>("/me"),

  listWorkspaces: () => apiRequest<Workspace[]>("/workspaces"),
  createWorkspace: (payload: { name: string; slug?: string }) =>
    apiRequest<Workspace>("/workspaces", { method: "POST", body: payload }),

  listWorkspaceMembers: (workspaceId: number) =>
    apiRequest<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),

  listProjects: (workspaceId: number) =>
    apiRequest<Project[]>("/projects", { query: { workspaceId } }),
  createProject: (payload: {
    workspaceId: number;
    name: string;
    description?: string;
  }) => apiRequest<Project>("/projects", { method: "POST", body: payload }),

  listBoards: (projectId: number) =>
    apiRequest<Board[]>("/boards", { query: { projectId } }),
  createBoard: (payload: { projectId: number; name: string }) =>
    apiRequest<Board>("/boards", { method: "POST", body: payload }),

  listColumns: (boardId: number) =>
    apiRequest<Column[]>("/columns", { query: { boardId } }),
  createColumn: (payload: { boardId: number; name: string; position?: number }) =>
    apiRequest<Column>("/columns", { method: "POST", body: payload }),
  updateColumn: (id: number, payload: { name?: string; position?: number }) =>
    apiRequest<Column>(`/columns/${id}`, { method: "PATCH", body: payload }),

  listTasks: (boardId: number) =>
    apiRequest<Task[]>("/tasks", { query: { boardId } }),
  createTask: (payload: {
    columnId: number;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string | null;
    position?: number;
  }) => apiRequest<Task>("/tasks", { method: "POST", body: payload }),
  updateTask: (
    id: number,
    payload: {
      title?: string;
      description?: string;
      priority?: string;
      dueDate?: string | null;
      columnId?: number;
      position?: number;
      archived?: boolean;
    },
  ) => apiRequest<Task>(`/tasks/${id}`, { method: "PATCH", body: payload }),
  deleteTask: (id: number) =>
    apiRequest<void>(`/tasks/${id}`, { method: "DELETE" }),

  listAssignees: (taskId: number) =>
    apiRequest<TaskAssignee[]>(`/tasks/${taskId}/assignees`),
  addAssignee: (taskId: number, payload: { userId: string }) =>
    apiRequest<TaskAssignee>(`/tasks/${taskId}/assignees`, {
      method: "POST",
      body: payload,
    }),
  removeAssignee: (taskId: number, userId: string) =>
    apiRequest<void>(`/tasks/${taskId}/assignees/${userId}`, {
      method: "DELETE",
    }),

  listComments: (taskId: number) =>
    apiRequest<Comment[]>("/comments", { query: { taskId } }),
  createComment: (payload: { taskId: number; body: string }) =>
    apiRequest<Comment>("/comments", { method: "POST", body: payload }),
  deleteComment: (commentId: number) =>
    apiRequest<void>(`/comments/${commentId}`, { method: "DELETE" }),

  presignAttachment: (payload: {
    taskId: number;
    originalName: string;
    contentType: string;
    sizeBytes: number;
  }) =>
    apiRequest<{ uploadUrl: string; attachment: Attachment }>(
      "/attachments/presign",
      { method: "POST", body: payload },
    ),
  getAttachmentDownload: (id: number) =>
    apiRequest<{ url: string }>(`/attachments/${id}/download`),

  listNotifications: () => apiRequest<Notification[]>("/notifications"),
  markNotificationRead: (id: number) =>
    apiRequest<void>(`/notifications/${id}/read`, { method: "POST" }),

  searchTasks: (params: {
    q?: string;
    boardId?: number;
    projectId?: number;
    workspaceId?: number;
    assigneeId?: string;
    priority?: string;
    archived?: boolean;
  }) => apiRequest<Task[]>("/search", { query: params }),
};
