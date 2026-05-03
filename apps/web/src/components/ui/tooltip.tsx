"use client";

import { cloneElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface TooltipProps {
  content: ReactNode;
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  className?: string;
}

/**
 * Tooltip ligero, sin libs. Aparece en hover y focus, con delay de 250ms.
 * Accesible: usa aria-describedby para vincular el texto al trigger.
 */
export function Tooltip({ content, children, side = "top", className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoverTimeout(setTimeout(() => setOpen(true), 250));
  };
  const hide = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setOpen(false);
  };

  const trigger = cloneElement(children, {
    "aria-describedby": open ? id : undefined,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  } as any);

  return (
    <span className={cn("relative inline-flex", className)}>
      {trigger}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-foreground px-2 py-1 text-caption font-medium text-background shadow-lg animate-fade-in",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
