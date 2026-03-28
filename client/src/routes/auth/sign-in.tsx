import { createFileRoute, Link } from "@tanstack/react-router";
import { SignInForm } from "@/features/auth/SignInForm";

export const Route = createFileRoute("/auth/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <SignInForm />
      <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
        Need an account? <Link to="/auth/sign-up" className="text-[color:var(--accent)]">Sign up</Link>
      </div>
    </div>
  );
}
