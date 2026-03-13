import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("boards", () => {
  it("creates board under project", async () => {
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

    expect(boardRes.status).toBe(201);

    const listRes = await authedGet(
      `/api/boards?projectId=${projectRes.body.id}`,
    );
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(2); // includes auto-created board from project
  });
});
