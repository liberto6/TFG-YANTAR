import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "danger";

interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  heading?: ReactNode;
  icon?: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "border-info/30 bg-info/5 text-foreground",
  success: "border-success/30 bg-success/5 text-foreground",
  warning: "border-warning/30 bg-warning/5 text-foreground",
  danger: "border-danger/30 bg-danger/5 text-foreground",
};

const iconColorClasses: Record<AlertVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const defaultIcons: Record<AlertVariant, ReactNode> = {
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9 9.75A.75.75 0 019.75 9h.5a.75.75 0 01.75.75v3.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-3h-.25A.75.75 0 019 9.75z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L9 10.94 7.28 9.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.515 2.625H3.72c-1.345 0-2.187-1.458-1.515-2.625l6.28-10.875zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
};

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className = "", variant = "info", heading, icon, children, ...props }, ref) => {
    const resolvedIcon = icon ?? defaultIcons[variant];
    const hasHeading = Boolean(heading);
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex items-start gap-3 rounded-lg border p-3 text-body-sm",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <span className={cn("mt-0.5 h-5 w-5 shrink-0", iconColorClasses[variant])}>
          {resolvedIcon}
        </span>
        <div className="flex-1">
          {hasHeading && <div className="font-medium text-foreground">{heading}</div>}
          {children && (
            <div className={hasHeading ? "mt-0.5 text-muted-foreground" : undefined}>
              {children}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";

export { Alert, type AlertProps, type AlertVariant };
