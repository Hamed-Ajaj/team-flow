import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("projects", () => {
  it("creates project under workspace", async () => {
    const workspaceRes = await authedPost("/api/workspaces").send({
      name: "Workspace",
    });

    const projectRes = await authedPost("/api/projects").send({
      workspaceId: workspaceRes.body.id,
      name: "Project",
    });

    expect(projectRes.status).toBe(201);
    expect(projectRes.body.name).toBe("Project");

    const listRes = await authedGet(
      `/api/projects?workspaceId=${workspaceRes.body.id}`,
    );
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);
  });
});
