import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { setRealtimeServer } from "./emitter";

export const createRealtimeServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  setRealtimeServer(io);

  io.on("connection", (socket) => {
    socket.on("join", (room: string) => {
      socket.join(room);
      socket.to(room).emit("presence:join", { id: socket.id });
    });

    socket.on("leave", (room: string) => {
      socket.leave(room);
      socket.to(room).emit("presence:leave", { id: socket.id });
    });
  });

  return io;
};
