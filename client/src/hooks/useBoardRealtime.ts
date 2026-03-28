import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, joinBoardRoom } from "@/lib/sockets/client";
import { queryKeys } from "@/state/queries/keys";

const boardEvents = [
  "board:created",
  "board:updated",
  "board:deleted",
  "column:created",
  "column:updated",
  "column:deleted",
  "task:created",
  "task:updated",
  "task:moved",
  "task:deleted",
  "task:assignee_added",
  "task:assignee_removed",
  "comment:created",
  "attachment:created",
] as const;

export function useBoardRealtime(boardId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!Number.isFinite(boardId)) return;
    const socket = getSocket();
    const leave = joinBoardRoom(boardId);

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.columns(boardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(boardId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    };

    boardEvents.forEach((event) => socket.on(event, invalidate));

    return () => {
      boardEvents.forEach((event) => socket.off(event, invalidate));
      leave();
    };
  }, [boardId, queryClient]);
}
