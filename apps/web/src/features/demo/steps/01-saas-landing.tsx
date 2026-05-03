"use client";

import { DemoChapter } from "../components/DemoChapter";
import { DemoCursor } from "../components/DemoCursor";

/**
 * Paso 1 — Ana llega a yantar.app y ve la propuesta de valor.
 * Renderizamos una versión condensada de la SaaSLanding (hero + 3 ejes)
 * para que quepa cómodamente en el browser frame de la demo.
 */
export function Step01SaaSLanding() {
  return (
    <DemoChapter url="yantar.app">
      <div className="relative overflow-hidden p-8 sm:p-12">
        <DemoCursor
          initial={{ x: 60, y: 320 }}
          script={[
            { x: 320, y: 240, delay: 1500 },
            { x: 320, y: 240, delay: 1200, click: true },
          ]}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-32 top-12 h-60 w-60 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative space-y-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1 text-caption uppercase tracking-wider text-muted-foreground">
            Tu restaurante online en minutos
          </span>
          <h1 className="text-display leading-[1.05]">
            El canal de pedidos
            <br />
            que <span className="text-primary">vuelve a ser tuyo</span>.
          </h1>
          <p className="mx-auto max-w-xl text-body text-muted-foreground">
            Yantar pone tu restaurante online en minutos: tu URL, tu marca, tu
            cliente.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <span className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-body-sm font-medium text-primary-foreground shadow-sm">
              Crear cuenta gratis
            </span>
            <span className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-5 text-body-sm text-foreground">
              Ver cómo funciona
            </span>
          </div>
        </div>

        <div className="relative mt-10 grid gap-3 sm:grid-cols-3">
          <Pill label="Autonomía estratégica" />
          <Pill label="Sostenibilidad económica" />
          <Pill label="Eficiencia tecnológica" />
        </div>
      </div>
    </DemoChapter>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <p className="text-body-sm font-medium text-foreground">{label}</p>
    </div>
  );
}
