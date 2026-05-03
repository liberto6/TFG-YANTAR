import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger";

type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/10 text-danger",
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-caption",
  md: "px-2.5 py-0.5 text-body-sm",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "neutral", size = "sm", dot, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[variant])} />}
      {children}
    </span>
  ),
);

Badge.displayName = "Badge";

export { Badge, type BadgeProps, type BadgeVariant };
