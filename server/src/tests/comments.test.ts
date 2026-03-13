import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("comments", () => {
  it("creates and lists comments", async () => {
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

    const commentRes = await authedPost("/api/comments").send({
      taskId: taskRes.body.id,
      body: "Comment",
    });

    expect(commentRes.status).toBe(201);

    const listRes = await authedGet(`/api/comments?taskId=${taskRes.body.id}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);
  });
});
