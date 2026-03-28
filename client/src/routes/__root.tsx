import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppProviders } from "@/app/providers/AppProviders";
import { Logo } from "@/components/Logo";
import { TopNav } from "@/components/TopNav";
import { NotificationsPanel } from "@/features/notifications/NotificationsPanel";

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootError,
  notFoundComponent: NotFoundRoute,
});

function RootComponent() {
  const location = useRouterState({ select: (state) => state.location });
  const isAuthRoute = location.pathname.startsWith("/auth");

  return (
    <AppProviders>
      <div className="min-h-screen bg-[color:var(--surface)] text-[color:var(--ink)]">
        {!isAuthRoute ? <TopNav /> : null}
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <Logo />
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
              Industrial workflow suite
            </div>
          </div>
          <div className="grid-ambient rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-2)]/60 p-6">
            <Outlet />
          </div>
        </main>
        <NotificationsPanel />
      </div>
    </AppProviders>
  );
}

function NotFoundRoute() {
  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-3)] p-6">
      <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
        Not Found
      </div>
      <div className="mt-3 text-lg font-semibold">That route does not exist.</div>
      <div className="mt-2 text-sm text-[color:var(--muted)]">
        Return to Workspaces and continue from there.
      </div>
    </div>
  );
}

function RootError({ error }: { error: unknown }) {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error);
  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface-3)] p-6">
      <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Error</div>
      <div className="mt-3 text-lg font-semibold">Something went wrong.</div>
      <div className="mt-2 text-sm text-[color:var(--muted)]">{message}</div>
    </div>
  );
}
