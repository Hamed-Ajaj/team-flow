import { createFileRoute } from "@tanstack/react-router";
import { ProjectList } from "@/features/project/ProjectList";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/workspaces/$workspaceId/projects")({
  component: ProjectsRoute,
});

function ProjectsRoute() {
  const { workspaceId } = Route.useParams();
  const session = useRequireAuth();
  if (session.isPending) {
    return <div className="text-sm text-[color:var(--muted)]">Loading...</div>;
  }
  return <ProjectList workspaceId={Number(workspaceId)} />;
}
