"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/cn";

type AlertDialogVariant = "info" | "danger";

interface AlertDialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: AlertDialogVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AlertDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "info",
  loading = false,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus management + body scroll lock + escape + focus trap
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the cancel button by default (safer for destructive actions)
    queueMicrotask(() => {
      const focusTarget =
        variant === "danger"
          ? dialogRef.current?.querySelector<HTMLButtonElement>("[data-cancel]")
          : confirmRef.current;
      focusTarget?.focus();
    });

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, variant, onCancel]);

  if (!open) return null;

  const Icon = variant === "danger" ? AlertTriangle : Info;
  const iconClass = variant === "danger" ? "bg-danger/10 text-danger" : "bg-info/10 text-info";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in"
      aria-hidden="false"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby={description ? "alert-dialog-description" : undefined}
        className="relative w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-xl animate-slide-in-bottom sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              iconClass,
            )}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="alert-dialog-title" className="text-h3 text-foreground">
              {title}
            </h2>
            {description && (
              <p
                id="alert-dialog-description"
                className="mt-1 text-body-sm text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            data-cancel
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={variant === "danger" ? "destructive" : "default"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
