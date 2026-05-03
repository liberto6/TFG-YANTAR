import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  illustration?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  tone?: "neutral" | "warning";
}

/**
 * Empty state consistente: ilustración + título + descripción + acción opcional.
 * Bordes punteados, fondo sutil, animación de entrada suave.
 */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
  tone = "neutral",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center animate-fade-in-up",
        className,
      )}
    >
      {illustration && (
        <div
          className={cn(
            "rounded-2xl bg-background p-4",
            tone === "warning" ? "text-warning" : "text-muted-foreground",
          )}
        >
          {illustration}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <p className="text-h3 text-foreground">{title}</p>
        {description && (
          <p className="text-body-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
