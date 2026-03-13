import { beforeEach, describe, expect, it } from "vitest";
import { authedGet, authedPost, authedPatch } from "./helpers";
import { resetDatabase } from "./db";

beforeEach(async () => {
  await resetDatabase();
});

describe("workspaces", () => {
  it("creates and lists workspaces", async () => {
    const createRes = await authedPost("/api/workspaces").send({
      name: "My Workspace",
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe("My Workspace");

    const listRes = await authedGet("/api/workspaces");
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);
  });
});
