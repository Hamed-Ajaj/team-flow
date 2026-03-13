import { eq } from "drizzle-orm";
import { db } from "../db";
import { notifications } from "../db/schema";

export const listNotifications = async (userId: string) => {
  return db.query.notifications.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
};

export const markNotificationRead = async (id: number, userId: string) => {
  const [notification] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(eq(notifications.id, id))
    .returning();

  if (!notification || notification.userId !== userId) {
    const error = new Error("forbidden");
    (error as { status?: number }).status = 403;
    throw error;
  }

  return notification;
};
