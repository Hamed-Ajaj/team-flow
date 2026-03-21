import type { Server } from "socket.io";

let io: Server | null = null;

export const setRealtimeServer = (server: Server) => {
  io = server;
};

export const emitBoardEvent = (
  boardId: number,
  event: string,
  payload: Record<string, unknown>,
) => {
  if (!io) return;
  io.to(`board:${boardId}`).emit(event, payload);
};
