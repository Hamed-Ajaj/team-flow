import { createFileRoute } from "@tanstack/react-router";
import { BoardList } from "@/features/board/BoardList";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/projects/$projectId/boards")({
  component: BoardsRoute,
});

function BoardsRoute() {
  const { projectId } = Route.useParams();
  const session = useRequireAuth();
  if (session.isPending) {
    return <div className="text-sm text-[color:var(--muted)]">Loading...</div>;
  }
  return <BoardList projectId={Number(projectId)} />;
}
