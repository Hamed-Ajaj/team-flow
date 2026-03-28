import { authClient } from "@/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";

export function SessionPanel() {
  const navigate = useNavigate();
  const session = authClient.useSession();

  const handleSignOut = async () => {
    // @ts-expect-error better-auth dynamic client
    await authClient.signOut();
    session.refetch();
    navigate({ to: "/auth/sign-in" });
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Session</CardTitle>
        <CardDescription>Session status and account metadata.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session.isPending ? (
          <div className="text-sm text-[color:var(--muted)]">Loading session...</div>
        ) : session.data?.user ? (
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">User</div>
              <div className="text-lg">{session.data.user.email}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">User ID</div>
              <div className="text-sm text-[color:var(--ink)]">{session.data.user.id}</div>
            </div>
            <Button variant="secondary" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <div className="text-sm text-[color:var(--muted)]">No active session.</div>
        )}
      </CardContent>
    </Card>
  );
}
