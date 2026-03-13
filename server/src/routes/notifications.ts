import { Router } from "express";
import { requireSession, type AuthedRequest } from "../middleware/auth";
import {
  listNotifications,
  markNotificationRead,
} from "../services/notifications";

export const notificationsRouter = Router();

notificationsRouter.use(requireSession);

notificationsRouter.get("/", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const notifications = await listNotifications(userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

notificationsRouter.post("/:id/read", async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).user.id;
    const id = Number(req.params.id);
    const notification = await markNotificationRead(id, userId);
    res.json(notification);
  } catch (err) {
    next(err);
  }
});
