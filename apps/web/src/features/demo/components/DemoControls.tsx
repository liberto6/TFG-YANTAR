"use client";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import type { DemoController } from "../hooks/use-demo-step";

export function DemoControls({ ctrl }: { ctrl: DemoController }) {
  const overallProgress =
    ctrl.total > 0
      ? ((ctrl.index + ctrl.progress) / ctrl.total) * 100
      : 0;

  const isLast = ctrl.index === ctrl.total - 1;

  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto max-w-6xl px-6 py-3">
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-[width] duration-150"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-caption text-muted-foreground">
            Paso{" "}
            <span className="font-medium text-foreground">
              {ctrl.index + 1}
            </span>{" "}
            de {ctrl.total}
          </div>

          <div className="flex items-center gap-2">
            <ControlButton
              onClick={ctrl.prev}
              disabled={ctrl.index === 0}
              label="Anterior"
            >
              <ChevronLeft size={18} />
            </ControlButton>

            {isLast ? (
              <button
                onClick={() => ctrl.goTo(0)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-body-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <RotateCcw size={14} />
                Reiniciar demo
              </button>
            ) : (
              <button
                onClick={ctrl.togglePlay}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={ctrl.isPlaying ? "Pausar" : "Reproducir"}
              >
                {ctrl.isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}

            <ControlButton
              onClick={ctrl.next}
              disabled={isLast}
              label="Siguiente"
            >
              <ChevronRight size={18} />
            </ControlButton>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={14} />
            Salir
          </Link>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </button>
  );
}
