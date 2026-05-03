"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { DemoCursor } from "../components/DemoCursor";
import { DEMO_COMPANY } from "../data/napoli-fixtures";

/**
 * Paso 3 — Pantalla de bienvenida tras el alta. Muestra la URL pública del
 * tenant recién creado y el botón para entrar al panel admin.
 */
export function Step03Welcome() {
  const url = `napoli.yantar.app`;
  return (
    <DemoChapter url="yantar.app/register-business">
      <div className="relative flex flex-col items-center justify-center gap-6 p-12 text-center">
        <DemoCursor
          initial={{ x: 100, y: 80 }}
          script={[
            { x: 380, y: 360, delay: 4000 },
            { x: 380, y: 360, delay: 800, click: true },
          ]}
        />
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success animate-fade-in-up">
          <CheckCircle2 size={28} />
        </span>

        <div className="space-y-2">
          <h2 className="text-h1 text-foreground">¡Bienvenida a Yantar!</h2>
          <p className="text-body text-muted-foreground">
            Hemos creado tu restaurante{" "}
            <strong className="text-foreground">{DEMO_COMPANY.name}</strong>.
          </p>
        </div>

        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-4">
          <p className="text-caption uppercase tracking-wider text-muted-foreground">
            Tu URL pública
          </p>
          <p className="mt-1 break-all font-mono text-h3 text-primary">{url}</p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex h-11 items-center justify-center gap-1 rounded-md bg-primary px-6 text-body font-medium text-primary-foreground shadow-sm"
        >
          Entrar al panel
          <ArrowRight size={16} />
        </button>
      </div>
    </DemoChapter>
  );
}
