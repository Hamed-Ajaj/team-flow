import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { env } from "../config/env";
import { db } from "../db";
import { attachments } from "../db/schema";
import { requireWorkspaceMember } from "./rbac";

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: env.S3_ACCESS_KEY && env.S3_SECRET_KEY
    ? {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      }
    : undefined,
  forcePathStyle: Boolean(env.S3_ENDPOINT),
});

export const getAttachmentDownloadUrl = async (
  attachmentId: number,
  userId: string,
) => {
  const attachment = await db.query.attachments.findFirst({
    where: (table, { eq }) => eq(table.id, attachmentId),
    with: { task: { with: { column: { with: { board: { with: { project: true } } } } } } },
  });

  if (!attachment?.task?.column?.board?.project) throw new Error("not_found");

  await requireWorkspaceMember(
    attachment.task.column.board.project.workspaceId,
    userId,
  );

  const command = new GetObjectCommand({
    Bucket: attachment.bucket,
    Key: attachment.storageKey,
  });

  const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

  return { downloadUrl };
};
