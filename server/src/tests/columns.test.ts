import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("columns", () => {
  it("creates and lists columns", async () => {
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

    expect(columnRes.status).toBe(201);

    const listRes = await authedGet(
      `/api/columns?boardId=${boardRes.body.id}`,
    );
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBeGreaterThan(0);
  });
});
