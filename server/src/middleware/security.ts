import type { Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const applySecurity = (app: Express) => {
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
  });

  app.use("/api/", apiLimiter);
  app.use("/api/auth", authLimiter);
};
