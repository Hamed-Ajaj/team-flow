import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost } from "./helpers";
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
      `/api/activity?workspaceId=${workspaceRes.body.id}`,
    );

    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBeGreaterThan(0);
  });
});
