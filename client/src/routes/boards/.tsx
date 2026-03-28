import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/features/board/KanbanBoard";

export const Route = createFileRoute("/boards/$boardId")({
  component: BoardRoute,
});

function BoardRoute() {
  const { boardId } = Route.useParams();
  return <KanbanBoard boardId={Number(boardId)} />;
}
