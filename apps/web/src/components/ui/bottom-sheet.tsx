"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Altura máxima como fracción del viewport. Default 0.92. */
  maxHeight?: number;
  /** Cierra al hacer click en el overlay. Default true. */
  closeOnOverlayClick?: boolean;
}

/**
 * Bottom sheet reutilizable. Anima desde abajo en mobile-like fashion (Wolt,
 * Glovo, iOS Apple Music). Bloquea el scroll del body mientras está abierto y
 * cierra con Escape o click en overlay.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = 0.92,
  closeOnOverlayClick = true,
}: BottomSheetProps) {
  // Bloqueo del scroll de fondo + cierre con Escape.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl border-t border-border bg-background shadow-2xl animate-slide-in-bottom",
        )}
        style={{ maxHeight: `${maxHeight * 100}vh` }}
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1">
          <span className="h-1.5 w-10 rounded-full bg-border" aria-hidden />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X size={16} />
        </button>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
