import { useMemo, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/endpoints";
import type { Task } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/state/queries/keys";

type TaskDrawerProps = {
  task: Task | null;
  boardId: number;
  open: boolean;
  onClose: () => void;
};

export function TaskDrawer({ task, boardId, open, onClose }: TaskDrawerProps) {
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [uploading, setUploading] = useState(false);

  const commentsQuery = useQuery({
    queryKey: task?.id ? queryKeys.comments(task.id) : ["comments", "empty"],
    queryFn: () => api.listComments(task!.id),
    enabled: Boolean(task?.id),
  });

  const addComment = useMutation({
    mutationFn: (body: string) => api.createComment({ taskId: task!.id, body }),
    onSuccess: () => {
      setCommentBody("");
      if (task?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(task.id) });
      }
    },
  });

  const addAssignee = useMutation({
    mutationFn: (userId: string) => api.addAssignee(task!.id, { userId }),
    onSuccess: () => {
      setAssigneeId("");
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(boardId) });
    },
  });

  const removeAssignee = useMutation({
    mutationFn: (userId: string) => api.removeAssignee(task!.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(boardId) });
    },
  });

  const attachments = useMemo(() => task?.attachments ?? [], [task]);

  const onUpload = async (file: File) => {
    if (!task) return;
    setUploading(true);
    try {
      const { uploadUrl } = await api.presignAttachment({
        taskId: task.id,
        originalName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(boardId) });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) onClose();
    },
    [onClose],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {task ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>{task.title}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{task.priority}</Badge>
                {task.dueDate ? (
                  <Badge variant="muted">Due {new Date(task.dueDate).toLocaleDateString()}</Badge>
                ) : null}
              </div>
            </DialogHeader>

            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Description</div>
              <div className="mt-2 text-sm text-[color:var(--ink)]">
                {task.description || "No description."}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Assignees</div>
              <div className="flex flex-wrap gap-2">
                {task.assignees?.length ? (
                  task.assignees.map((assignee) => (
                    <Button
                      key={assignee.id}
                      size="sm"
                      variant="secondary"
                      onClick={() => removeAssignee.mutate(assignee.userId)}
                    >
                      {assignee.userId}
                    </Button>
                  ))
                ) : (
                  <span className="text-sm text-[color:var(--muted)]">No assignees</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="User ID"
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!assigneeId}
                  onClick={() => addAssignee.mutate(assigneeId)}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Attachments</div>
              <div className="space-y-2">
                {attachments.length ? (
                  attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between rounded-md border border-[color:var(--line)] bg-[color:var(--surface-3)] px-3 py-2 text-sm"
                    >
                      <span>{attachment.originalName}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          const { url } = await api.getAttachmentDownload(attachment.id);
                          window.open(url, "_blank");
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[color:var(--muted)]">No attachments yet.</div>
                )}
              </div>
              <input
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void onUpload(file);
                }}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Comments</div>
              <div className="space-y-2">
                {commentsQuery.data?.length ? (
                  commentsQuery.data.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-md border border-[color:var(--line)] bg-[color:var(--surface-3)] p-3 text-sm"
                    >
                      <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        {comment.authorUserId}
                      </div>
                      <div className="mt-2">{comment.body}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[color:var(--muted)]">No comments yet.</div>
                )}
              </div>
              <Textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder="Add a comment"
              />
              <Button
                variant="secondary"
                onClick={() => addComment.mutate(commentBody)}
                disabled={!commentBody}
              >
                Add comment
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[color:var(--muted)]">No task selected.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
