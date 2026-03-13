import { z } from "zod";

export const createBoardSchema = z.object({
  projectId: z.number().int().positive(),
  name: z.string().min(2).max(120),
});

export const updateBoardSchema = z.object({
  name: z.string().min(2).max(120).optional(),
});
