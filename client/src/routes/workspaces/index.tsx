import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceList } from "@/features/workspace/WorkspaceList";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/workspaces/")({
  component: WorkspacesRoute,
});

function WorkspacesRoute() {
  const session = useRequireAuth();

  if (session.isPending) {
    return <div className="text-sm text-[color:var(--muted)]">Loading...</div>;
  }

  return <WorkspaceList />;
}
