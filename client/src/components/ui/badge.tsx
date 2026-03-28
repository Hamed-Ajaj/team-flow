import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-[color:var(--line)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.2em]",
  {
    variants: {
      variant: {
        default: "bg-[color:var(--surface-3)] text-[color:var(--ink)]",
        accent: "bg-[color:var(--accent)] text-black",
        danger: "bg-[color:var(--accent-2)] text-white",
        muted: "bg-[color:var(--surface-2)] text-[color:var(--muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
