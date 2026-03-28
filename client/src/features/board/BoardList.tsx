import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/state/queries/hooks";
import { api } from "@/lib/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/state/queries/keys";

export function BoardList({ projectId }: { projectId: number }) {
  const { data, isLoading } = useBoards(projectId);
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const createBoard = useMutation({
    mutationFn: () => api.createBoard({ projectId, name }),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: queryKeys.boards(projectId) });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Boards</CardTitle>
        <CardDescription>Choose a board to open the kanban.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-[color:var(--muted)]">Loading boards...</div>
        ) : data?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.map((board) => (
              <Link
                key={board.id}
                to="/boards/$boardId"
                params={{ boardId: String(board.id) }}
                className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-3)] p-4 transition hover:border-[color:var(--accent)]"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Board</div>
                <div className="mt-2 text-lg font-semibold">{board.name}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[color:var(--muted)]">No boards yet.</div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="New board name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => createBoard.mutate()}
            disabled={!name || createBoard.isPending}
          >
            Create
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
