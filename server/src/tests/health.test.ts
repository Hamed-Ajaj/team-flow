import request from "supertest";
import { it, expect } from "vitest";
import { app } from "../app";

it("GET /api/health returns ok", async () => {
  const response = await request(app).get("/api/health");
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: "ok" });
});
