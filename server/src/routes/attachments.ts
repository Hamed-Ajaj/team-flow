import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import { createAttachmentSchema } from "../validators/attachments";
import { createAttachmentPresign } from "../services/attachments";
import { getAttachmentDownloadUrl } from "../services/attachments-download";

export const attachmentsRouter = Router();

attachmentsRouter.use(requireSession);

attachmentsRouter.post("/presign", async (req, res, next) => {
  try {
    const data = createAttachmentSchema.parse(req.body);
    const userId = (req as AuthedRequest).user.id;
    const result = await createAttachmentPresign({
      ...data,
      userId,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

attachmentsRouter.get("/:id/download", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const id = Number(req.params.id);
    const result = await getAttachmentDownloadUrl(id, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
