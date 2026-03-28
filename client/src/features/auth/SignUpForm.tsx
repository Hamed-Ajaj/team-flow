import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { authClient } from "@/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export function SignUpForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const formatError = (err: unknown, response?: any) => {
    const apiMessage =
      response?.error?.message ||
      response?.error?.statusText ||
      response?.error?.status;
    if (apiMessage) return String(apiMessage);
    if (err instanceof Error) {
      if (err.message.includes("Failed to fetch")) {
        return "Unable to reach the server. Check API origin or CORS.";
      }
      return err.message;
    }
    return "Sign up failed.";
  };

  const formatFieldError = (err: unknown) => {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
      return (err as any).message;
    }
    return "Invalid value.";
  };

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onChange: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        // @ts-expect-error better-auth dynamic client
        const response = await authClient.signUp.email(value);
        if (response?.error) {
          setError(formatError(null, response));
          return;
        }
        navigate({ to: "/workspaces" });
      } catch (err) {
        setError(formatError(err));
      }
    },
  });

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Spin up a workspace in minutes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Name</label>
                <Input
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  required
                />
                {field.state.meta.errors?.length ? (
                  <div className="text-sm text-[color:var(--accent-2)]">
                    {formatFieldError(field.state.meta.errors[0])}
                  </div>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Email</label>
                <Input
                  type="email"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  required
                />
                {field.state.meta.errors?.length ? (
                  <div className="text-sm text-[color:var(--accent-2)]">
                    {formatFieldError(field.state.meta.errors[0])}
                  </div>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Password</label>
                <Input
                  type="password"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                  required
                />
                {field.state.meta.errors?.length ? (
                  <div className="text-sm text-[color:var(--accent-2)]">
                    {formatFieldError(field.state.meta.errors[0])}
                  </div>
                ) : null}
              </div>
            )}
          </form.Field>
          {error ? <div className="text-sm text-[color:var(--accent-2)]">{error}</div> : null}
          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([isSubmitting]) => (
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
