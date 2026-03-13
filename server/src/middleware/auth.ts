import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";

export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export type AuthedRequest = Request & {
  user: AuthUser;
};

export const requireSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV === "test") {
    const testUserId = req.headers["x-test-user-id"];
    if (typeof testUserId === "string" && testUserId.length > 0) {
      (req as AuthedRequest).user = { id: testUserId } as AuthUser;
      return next();
    }
  }

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "unauthorized" });
  }

  (req as AuthedRequest).user = {
    id: session.user.id,
    email: session.user.email ?? null,
    name: (session.user as { name?: string }).name ?? null,
  };

  return next();
};
