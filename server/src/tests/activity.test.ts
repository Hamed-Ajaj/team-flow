import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost, authedPatch } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("activity", () => {
  it("lists activity entries", async () => {
    const workspaceRes = await authedPost("/api/workspaces").send({
      name: "Workspace",
    });

    const listRes = await authedGet(
      `/api/activity?workspaceId=${workspaceRes.body.id}&entityType=workspace`,
    );

    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBeGreaterThan(0);
  });

  it("logs task move", async () => {
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

    const columnA = await authedPost("/api/columns").send({
      boardId: boardRes.body.id,
      name: "A",
    });

    const columnB = await authedPost("/api/columns").send({
      boardId: boardRes.body.id,
      name: "B",
    });

    const taskRes = await authedPost("/api/tasks").send({
      columnId: columnA.body.id,
      title: "Task",
    });

    await authedPatch(`/api/tasks/${taskRes.body.id}`).send({
      columnId: columnB.body.id,
      position: 0,
    });

    const listRes = await authedGet(
      `/api/activity?workspaceId=${workspaceRes.body.id}&entityType=task`,
    );

    expect(listRes.status).toBe(200);
    expect(listRes.body.some((log: { action: string }) => log.action === "moved")).toBe(true);
  });
});
