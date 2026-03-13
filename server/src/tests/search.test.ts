import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("search", () => {
  it("searches tasks by query", async () => {
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

    await authedPost("/api/tasks").send({
      columnId: columnRes.body.id,
      title: "Fix bug",
    });

    const searchRes = await authedGet(
      `/api/search?boardId=${boardRes.body.id}&q=bug`,
    );

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.length).toBe(1);
  });
});
