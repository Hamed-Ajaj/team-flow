import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/auth-client";

export function useRequireAuth() {
  const navigate = useNavigate();
  const session = authClient.useSession();

  useEffect(() => {
    if (session.isPending) return;
    if (!session.data?.user) {
      navigate({ to: "/auth/sign-in" });
    }
  }, [navigate, session.data, session.isPending]);

  return session;
}
