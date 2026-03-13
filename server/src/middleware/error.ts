import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "validation_error", issues: err.issues });
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  const message = status === 500 ? "internal_server_error" : err.message;
  if (status === 500) console.error(err);
  return res.status(status).json({ error: message });
};
