import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
};

export const joinBoardRoom = (boardId: number) => {
  const client = getSocket();
  client.emit("join", `board:${boardId}`);
  return () => client.emit("leave", `board:${boardId}`);
};
