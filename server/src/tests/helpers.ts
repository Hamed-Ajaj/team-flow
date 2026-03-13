import request from "supertest";
import { app } from "../app";

export const testUserId = "test-user-1";

export const authedGet = (path: string) =>
  request(app).get(path).set("x-test-user-id", testUserId);

export const authedPost = (path: string) =>
  request(app).post(path).set("x-test-user-id", testUserId);

export const authedPatch = (path: string) =>
  request(app).patch(path).set("x-test-user-id", testUserId);

export const authedDelete = (path: string) =>
  request(app).delete(path).set("x-test-user-id", testUserId);
