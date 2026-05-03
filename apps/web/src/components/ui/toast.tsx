"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  description?: string;
  duration?: number;
}

const ICON: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const ICON_CLASS: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-info",
  warning: "text-warning",
};

const ACCENT_BORDER: Record<ToastVariant, string> = {
  success: "border-l-success",
  error: "border-l-danger",
  info: "border-l-info",
  warning: "border-l-warning",
};

interface ToastProps extends ToastItem {
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  variant,
  message,
  description,
  duration,
  onDismiss,
}: ToastProps) {
  const ms = duration ?? (variant === "error" ? 6000 : 4000);

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), ms);
    return () => clearTimeout(timer);
  }, [id, ms, onDismiss]);

  const Icon = ICON[variant];

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-l-4 border-border bg-background p-3 shadow-lg animate-slide-in-bottom",
        ACCENT_BORDER[variant],
      )}
    >
      <span className={cn("mt-0.5 shrink-0", ICON_CLASS[variant])}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-foreground">{message}</p>
        {description && (
          <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Cerrar notificación"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X size={14} />
      </button>
    </div>
  );
}
