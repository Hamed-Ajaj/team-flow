import { z } from "zod";

export const createAttachmentSchema = z.object({
  taskId: z.number().int().positive(),
  originalName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(255),
  sizeBytes: z.number().int().positive(),
});
