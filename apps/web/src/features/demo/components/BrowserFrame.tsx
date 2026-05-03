"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";

/**
 * Marco de navegador para envolver visualmente cada paso de la demo.
 * Muestra los tres botones de tráfico, una barra de URL ficticia y el
 * contenido del paso dentro de un viewport con bordes redondeados.
 */
export function BrowserFrame({
  url,
  device = "desktop",
  children,
}: {
  url: string;
  device?: "desktop" | "tablet" | "mobile";
  children: ReactNode;
}) {
  const widths: Record<typeof device, string> = {
    desktop: "max-w-4xl",
    tablet: "max-w-2xl",
    mobile: "max-w-sm",
  };

  return (
    <div
      className={`mx-auto w-full ${widths[device]} overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-primary/5`}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-border bg-background/80 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" aria-hidden />
        <div className="ml-2 flex flex-1 items-center gap-1.5 truncate rounded-md bg-secondary px-2.5 py-1 text-caption text-muted-foreground">
          <Lock size={10} className="text-success" />
          <span className="truncate">{url}</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-background">{children}</div>
    </div>
  );
}
