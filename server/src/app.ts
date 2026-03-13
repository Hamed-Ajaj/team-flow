import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.ts";
import { registerRoutes } from "./routes";
import { applySecurity } from "./middleware/security";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

applySecurity(app);

app.use(express.json());

registerRoutes(app);

app.use(errorHandler);
