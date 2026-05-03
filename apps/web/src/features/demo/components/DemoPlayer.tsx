"use client";

import { useEffect } from "react";
import { useDemoStep, type DemoRole } from "../hooks/use-demo-step";
import { DEMO_STEPS } from "../steps";
import { DemoControls } from "./DemoControls";
import { DemoNarration } from "./DemoNarration";

/**
 * Orquestador de la demo de Yantar.
 *
 * Layout: visual del paso (browser frame) + narración debajo + sidebar
 * agrupada por rol a la derecha. Atajos de teclado: Espacio (play/pause),
 * ← / → (navegar), R (reiniciar). Indicador visual cuando está pausado.
 */
export function DemoPlayer() {
  const ctrl = useDemoStep({ steps: DEMO_STEPS });
  const stepDef = DEMO_STEPS[ctrl.index]!;
  const StepComponent = stepDef.Component;

  // Atajos de teclado.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignora si el foco está en un input/textarea (por si acaso).
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          ctrl.togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          ctrl.next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          ctrl.prev();
          break;
        case "r":
        case "R":
          e.preventDefault();
          ctrl.goTo(0);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ctrl]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DemoHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-5">
            <div className="relative" key={stepDef.id}>
              <StepComponent />
              {!ctrl.isPlaying && <PausedOverlay />}
            </div>
            <DemoNarration
              role={stepDef.role}
              title={stepDef.title}
              narration={stepDef.narration}
            />
          </div>

          <aside className="hidden lg:block">
            <ChapterSidebar
              currentIndex={ctrl.index}
              onPick={ctrl.goTo}
            />
          </aside>
        </div>
      </main>

      <DemoControls ctrl={ctrl} />
    </div>
  );
}

function DemoHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-2 px-6 text-body-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            Y
          </span>
          <span className="font-semibold text-foreground">Yantar</span>
          <span className="text-muted-foreground">— Demo guiada</span>
        </div>
        <div className="hidden items-center gap-3 text-caption text-muted-foreground sm:flex">
          <Kbd>Espacio</Kbd> Play / Pausa
          <Kbd>← →</Kbd> Navegar
          <Kbd>R</Kbd> Reiniciar
        </div>
      </div>
    </header>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-foreground">
      {children}
    </kbd>
  );
}

function PausedOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-[1px] animate-fade-in">
      <span className="rounded-full border border-border bg-background/95 px-4 py-1.5 text-caption font-medium uppercase tracking-wider text-muted-foreground shadow-lg">
        En pausa
      </span>
    </div>
  );
}

const ROLE_GROUPS: { role: DemoRole; label: string }[] = [
  { role: "visitor", label: "Descubrimiento" },
  { role: "admin", label: "Restauradora" },
  { role: "customer", label: "Comensal" },
  { role: "operator", label: "Cocinero" },
];

function ChapterSidebar({
  currentIndex,
  onPick,
}: {
  currentIndex: number;
  onPick: (idx: number) => void;
}) {
  return (
    <nav
      aria-label="Capítulos de la demo"
      className="sticky top-16 space-y-3 rounded-2xl border border-border bg-surface p-3"
    >
      <p className="px-2 pt-0.5 text-caption uppercase tracking-wider text-muted-foreground">
        Capítulos
      </p>
      {ROLE_GROUPS.map((group) => {
        const items = DEMO_STEPS.map((s, i) => ({ ...s, index: i })).filter(
          (s) => s.role === group.role,
        );
        if (items.length === 0) return null;
        return (
          <div key={group.role} className="space-y-0.5">
            <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
            {items.map((s) => {
              const i = s.index;
              const active = i === currentIndex;
              const past = i < currentIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => onPick(i)}
                  className={[
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-body-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active
                      ? "bg-primary/10 text-primary"
                      : past
                        ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        : "text-muted-foreground/80 hover:bg-secondary hover:text-foreground",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                      active
                        ? "bg-primary text-primary-foreground"
                        : past
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
