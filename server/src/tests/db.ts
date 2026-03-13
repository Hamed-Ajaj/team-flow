import { sql } from "drizzle-orm";
import { db } from "../db";

export const resetDatabase = async () => {
  await db.execute(sql`
    TRUNCATE TABLE
      workspaces,
      workspace_members,
      projects,
      boards,
      columns,
      tasks,
      task_assignees,
      comments,
      attachments,
      notifications,
      activity_logs
    CASCADE;
  `);
};
