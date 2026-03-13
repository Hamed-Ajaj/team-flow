import { z } from "zod";

export const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  boardId: z.coerce.number().int().positive().optional(),
  projectId: z.coerce.number().int().positive().optional(),
  workspaceId: z.coerce.number().int().positive().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  archived: z.coerce.boolean().optional(),
});
