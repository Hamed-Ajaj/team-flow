import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/features/board/KanbanBoard";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export const Route = createFileRoute("/boards/$boardId/")({
  component: BoardRoute,
});

function BoardRoute() {
  const { boardId } = Route.useParams();
  const session = useRequireAuth();
  if (session.isPending) {
    return <div className="text-sm text-[color:var(--muted)]">Loading...</div>;
  }
  return <KanbanBoard boardId={Number(boardId)} />;
}
