import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[90px] w-full rounded-md border border-[color:var(--line)] bg-[color:var(--surface-2)] px-3 py-2 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--dim)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
