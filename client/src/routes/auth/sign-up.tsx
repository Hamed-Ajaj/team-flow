import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "@/features/auth/SignUpForm";

export const Route = createFileRoute("/auth/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <SignUpForm />
      <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
        Already have an account? <Link to="/auth/sign-in" className="text-[color:var(--accent)]">Sign in</Link>
      </div>
    </div>
  );
}
