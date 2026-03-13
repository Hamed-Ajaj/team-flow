import { z } from "zod";

export const createCommentSchema = z.object({
  taskId: z.number().int().positive(),
  body: z.string().min(1).max(5000),
});
