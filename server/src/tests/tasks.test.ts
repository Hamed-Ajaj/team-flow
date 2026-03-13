import { beforeEach, describe, expect, it } from "vitest";
import { authedPatch, authedPost } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("tasks", () => {
  it("creates and updates a task", async () => {
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
      description: "Details",
    });

    expect(taskRes.status).toBe(201);

    const updateRes = await authedPatch(`/api/tasks/${taskRes.body.id}`).send({
      title: "Updated",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe("Updated");
  });
});
