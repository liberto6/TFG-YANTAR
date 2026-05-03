"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { DemoChapter } from "../components/DemoChapter";

/**
 * Paso 17 — Recapitulación final con los tres ejes y CTA.
 */
export function Step17Recap() {
  return (
    <DemoChapter url="yantar.app">
      <div className="space-y-6 p-10 text-center">
        <h2 className="text-h1 text-foreground">Ciclo cerrado.</h2>
        <p className="mx-auto max-w-xl text-body text-muted-foreground">
          Sin instaladores, sin servidor propio, sin comisiones por pedido.
          Yantar conecta restaurador, operario y comensal en un único flujo
          end-to-end.
        </p>

        <ul className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">
          <RecapItem text="Una instancia, todos los restaurantes" />
          <RecapItem text="URL propia desde el primer minuto" />
          <RecapItem text="Tiempo real entre cocina y comensal" />
        </ul>

        <Link
          href="/register-business"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-body font-medium text-primary-foreground shadow-sm"
        >
          Crear mi restaurante
        </Link>
      </div>
    </DemoChapter>
  );
}

function RecapItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 rounded-xl border border-border bg-surface p-4 text-left text-body-sm">
      <Check size={14} className="mt-1 shrink-0 text-success" aria-hidden />
      <span className="text-foreground">{text}</span>
    </li>
  );
}
