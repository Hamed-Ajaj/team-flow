import { createFileRoute } from "@tanstack/react-router";
import { SessionPanel } from "@/features/auth/SessionPanel";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/session")({
  component: SessionRoute,
});

function SessionRoute() {
  const session = useRequireAuth();
  if (session.isPending) {
    return <div className="text-sm text-[color:var(--muted)]">Loading session...</div>;
  }
  return (
    <div className="flex justify-center">
      <SessionPanel />
    </div>
  );
}
