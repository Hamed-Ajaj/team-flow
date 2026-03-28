import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/state/stores/ui";

export function TopNav() {
  const setNotificationsOpen = useUIStore((state) => state.setNotificationsOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--surface-2)]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
          <Link to="/workspaces" className="hover:text-[color:var(--ink)]">
            Workspaces
          </Link>
          <Link to="/session" className="hover:text-[color:var(--ink)]">
            Session
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setNotificationsOpen(true)}>
            Notifications
          </Button>
        </div>
      </div>
    </header>
  );
}
