import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/auth-client";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  const navigate = useNavigate();
  const session = authClient.useSession();

  useEffect(() => {
    if (session.isPending) return;
    if (session.data?.user) {
      navigate({ to: "/workspaces" });
    } else {
      navigate({ to: "/auth/sign-in" });
    }
  }, [navigate, session.data, session.isPending]);

  return (
    <div className="text-sm text-[color:var(--muted)]">Redirecting...</div>
  );
}
