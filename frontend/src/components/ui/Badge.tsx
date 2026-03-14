import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "error";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-hover-bg text-text-secondary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-accent-secondary/10 text-accent-secondary",
  error: "bg-error/10 text-error",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap",
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
