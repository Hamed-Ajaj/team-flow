import { z } from "zod";

export const createColumnSchema = z.object({
  boardId: z.number().int().positive(),
  name: z.string().min(1).max(120),
  position: z.number().int().min(0).optional(),
});

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  position: z.number().int().min(0).optional(),
});
