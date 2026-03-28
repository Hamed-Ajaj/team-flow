import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspaces } from "@/state/queries/hooks";
import { api } from "@/lib/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/state/queries/keys";

export function WorkspaceList() {
  const { data, isLoading } = useWorkspaces();
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const createWorkspace = useMutation({
    mutationFn: () => api.createWorkspace({ name }),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Pick a workspace to enter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-[color:var(--muted)]">Loading workspaces...</div>
          ) : data?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.map((workspace) => (
                <Link
                  key={workspace.id}
                  to="/workspaces/$workspaceId/projects"
                  params={{ workspaceId: String(workspace.id) }}
                  className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-3)] p-4 transition hover:border-[color:var(--accent)]"
                >
                  <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Workspace</div>
                  <div className="mt-2 text-lg font-semibold">{workspace.name}</div>
                  <div className="text-xs text-[color:var(--dim)]">{workspace.slug}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[color:var(--muted)]">No workspaces yet.</div>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="New workspace name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => createWorkspace.mutate()}
              disabled={!name || createWorkspace.isPending}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
