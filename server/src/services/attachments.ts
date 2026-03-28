import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
import { attachFileRecord } from "./tasks";

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

export const createAttachmentPresign = async (input: {
  taskId: number;
  userId: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
}) => {
  if (!env.S3_BUCKET) throw new Error("S3_BUCKET missing");

  const key = `${input.taskId}/${crypto.randomUUID()}-${input.originalName}`;

  const uploadUrl =
    process.env.NODE_ENV === "test"
      ? `https://example.test/uploads/${encodeURIComponent(key)}`
      : await getSignedUrl(
          s3,
          new PutObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: key,
            ContentType: input.contentType,
          }),
          { expiresIn: 60 * 5 },
        );

  const attachment = await attachFileRecord(input.taskId, input.userId, {
    bucket: env.S3_BUCKET,
    storageKey: key,
    originalName: input.originalName,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
  });

  return { uploadUrl, attachment };
};
