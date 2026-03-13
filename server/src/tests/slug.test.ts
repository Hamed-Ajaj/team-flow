import { it, expect } from "vitest";
import { slugify } from "../utils/slug";

it("slugify normalizes strings", () => {
  expect(slugify("My Workspace")).toBe("my-workspace");
  expect(slugify("  Hello---World  ")).toBe("hello-world");
});
