import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("attachments", () => {
  it("creates presign and download url", async () => {
    const workspaceRes = await authedPost("/api/workspaces").send({
      name: "Workspace",
    });

    const projectRes = await authedPost("/api/projects").send({
      workspaceId: workspaceRes.body.id,
      name: "Project",
    });

    const boardRes = await authedPost("/api/boards").send({
      projectId: projectRes.body.id,
      name: "Board",
    });

    const columnRes = await authedPost("/api/columns").send({
      boardId: boardRes.body.id,
      name: "Backlog",
    });

    const taskRes = await authedPost("/api/tasks").send({
      columnId: columnRes.body.id,
      title: "Task",
    });

    const presignRes = await authedPost("/api/attachments/presign").send({
      taskId: taskRes.body.id,
      originalName: "file.txt",
      contentType: "text/plain",
      sizeBytes: 10,
    });

    expect(presignRes.status).toBe(201);
    expect(presignRes.body.uploadUrl).toBeTruthy();

    const downloadRes = await authedGet(
      `/api/attachments/${presignRes.body.attachment.id}/download`,
    );

    expect(downloadRes.status).toBe(200);
    expect(downloadRes.body.downloadUrl).toBeTruthy();
  });
});
