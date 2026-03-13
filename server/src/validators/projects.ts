import { z } from "zod";

export const createProjectSchema = z.object({
  workspaceId: z.number().int().positive(),
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(1000).optional(),
});
