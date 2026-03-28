import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/endpoints";
import { queryKeys } from "@/state/queries/keys";
import type { Column, Task } from "@/types/api";

export const useWorkspaces = () =>
  useQuery({ queryKey: queryKeys.workspaces, queryFn: api.listWorkspaces });

export const useProjects = (workspaceId: number) =>
  useQuery({
    queryKey: queryKeys.projects(workspaceId),
    queryFn: () => api.listProjects(workspaceId),
    enabled: Number.isFinite(workspaceId),
  });

export const useBoards = (projectId: number) =>
  useQuery({
    queryKey: queryKeys.boards(projectId),
    queryFn: () => api.listBoards(projectId),
    enabled: Number.isFinite(projectId),
  });

export const useColumns = (boardId: number) =>
  useQuery({
    queryKey: queryKeys.columns(boardId),
    queryFn: () => api.listColumns(boardId),
    enabled: Number.isFinite(boardId),
  });

export const useTasks = (boardId: number) =>
  useQuery({
    queryKey: queryKeys.tasks(boardId),
    queryFn: () => api.listTasks(boardId),
    enabled: Number.isFinite(boardId),
  });

export const useNotifications = () =>
  useQuery({ queryKey: queryKeys.notifications, queryFn: api.listNotifications });

export const useSearchTasks = (params: {
  q?: string;
  boardId?: number;
  projectId?: number;
  workspaceId?: number;
  assigneeId?: string;
  priority?: string;
  archived?: boolean;
}) =>
  useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => api.searchTasks(params),
    enabled: Boolean(params.q) || Boolean(params.assigneeId) || Boolean(params.priority),
  });

export const useUpdateTask = (boardId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Task> }) =>
      api.updateTask(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks(boardId) });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks(boardId));
      if (!previous) return { previous };
      queryClient.setQueryData<Task[]>(queryKeys.tasks(boardId),
        previous.map((task) => (task.id === id ? { ...task, ...payload } : task)),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks(boardId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(boardId) });
    },
  });
};

export const useUpdateColumn = (boardId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Column> }) =>
      api.updateColumn(id, payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns(boardId) });
    },
  });
};
