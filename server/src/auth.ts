import { betterAuth } from "better-auth";
import { authDatabase } from "./auth-db";
import { env } from "./config/env.js";

const secret = env.BETTER_AUTH_SECRET;
const baseURL = env.BETTER_AUTH_URL;

export const auth = betterAuth({
  secret,
  baseURL,
  database: authDatabase,
  trustedOrigins: [
    process.env.CLIENT_URL || "http://localhost:5173",
    baseURL,
  ],
  emailAndPassword: {
    enabled: true,
  },
});
