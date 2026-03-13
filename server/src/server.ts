import "dotenv/config";
import { createServer } from "http";
import { app } from "./app";
import { testDB } from "./db";
import { createRealtimeServer } from "./realtime";
import { env } from "./config/env";

const PORT = env.PORT ? Number(env.PORT) : 4000;

const startServer = async () => {
  await testDB();
  const server = createServer(app);
  createRealtimeServer(server);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
