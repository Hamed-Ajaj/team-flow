export const queryKeys = {
  workspaces: ["workspaces"] as const,
  workspaceMembers: (workspaceId: number) =>
    ["workspace-members", workspaceId] as const,
  projects: (workspaceId: number) => ["projects", workspaceId] as const,
  boards: (projectId: number) => ["boards", projectId] as const,
  columns: (boardId: number) => ["columns", boardId] as const,
  tasks: (boardId: number) => ["tasks", boardId] as const,
  comments: (taskId: number) => ["comments", taskId] as const,
  notifications: ["notifications"] as const,
  search: (params: Record<string, unknown>) => ["search", params] as const,
};
