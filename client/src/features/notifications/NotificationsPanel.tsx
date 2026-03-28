import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/state/queries/hooks";
import { useUIStore } from "@/state/stores/ui";
import { api } from "@/lib/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/state/queries/keys";

export function NotificationsPanel() {
  const open = useUIStore((state) => state.notificationsOpen);
  const setOpen = useUIStore((state) => state.setNotificationsOpen);
  const { data } = useNotifications();
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: (id: number) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3">
          {data?.length ? (
            data.map((notification) => (
              <div key={notification.id} className="rounded-lg border border-[color:var(--line)] bg-[color:var(--surface-3)] p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  {notification.type}
                </div>
                <div className="mt-2 text-sm text-[color:var(--ink)]">
                  {JSON.stringify(notification.payload)}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--dim)]">
                  <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  {!notification.readAt ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => markRead.mutate(notification.id)}
                    >
                      Mark read
                    </Button>
                  ) : (
                    <span className="uppercase tracking-[0.2em]">Read</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-[color:var(--muted)]">No notifications yet.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
