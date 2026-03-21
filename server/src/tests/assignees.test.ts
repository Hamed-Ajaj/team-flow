import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost, authedDelete } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("assignees", () => {
  it("adds and removes assignees", async () => {
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

    const addRes = await authedPost(
      `/api/tasks/${taskRes.body.id}/assignees`,
    ).send({ userId: "assignee-1" });

    expect(addRes.status).toBe(201);

    const listRes = await authedGet(
      `/api/tasks/${taskRes.body.id}/assignees`,
    );
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);

    const removeRes = await authedDelete(
      `/api/tasks/${taskRes.body.id}/assignees/assignee-1`,
    );
    expect(removeRes.status).toBe(200);
  });
});
