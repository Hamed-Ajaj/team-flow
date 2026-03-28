import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/state/queries/hooks";
import { api } from "@/lib/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/state/queries/keys";

export function ProjectList({ workspaceId }: { workspaceId: number }) {
  const { data, isLoading } = useProjects(workspaceId);
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: () => api.createProject({ workspaceId, name }),
    onSuccess: () => {
      setName("");
      queryClient.invalidateQueries({ queryKey: queryKeys.projects(workspaceId) });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Projects inside workspace #{workspaceId}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-sm text-[color:var(--muted)]">Loading projects...</div>
        ) : data?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.map((project) => (
              <Link
                key={project.id}
                to="/projects/$projectId/boards"
                params={{ projectId: String(project.id) }}
                className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-3)] p-4 transition hover:border-[color:var(--accent)]"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Project</div>
                <div className="mt-2 text-lg font-semibold">{project.name}</div>
                <div className="text-xs text-[color:var(--dim)]">{project.description || "No description"}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[color:var(--muted)]">No projects yet.</div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="New project name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button
            variant="secondary"
            onClick={() => createProject.mutate()}
            disabled={!name || createProject.isPending}
          >
            Create
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
