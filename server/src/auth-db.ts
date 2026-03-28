import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

export const authDatabase = drizzleAdapter(db, {
  provider: "pg",
  schema,
});
