"use client";

import { Bell, Bike, Clock } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { DEMO_ORDER } from "../data/napoli-fixtures";

/**
 * Paso 14 — La cocina ve aparecer el pedido recién creado en la columna
 * PENDIENTE. Animación de entrada + badge de "nuevo" pulsando para enfatizar
 * que ha llegado por WebSocket en tiempo real.
 */
export function Step14OperativoReceive() {
  return (
    <DemoChapter url="napoli.yantar.app/operativo" device="tablet">
      <KanbanShell highlight="pending" />
    </DemoChapter>
  );
}

export function KanbanShell({
  highlight,
}: {
  highlight: "pending" | "accepted" | "preparing" | "ready";
}) {
  return (
    <div className="space-y-4 bg-background p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 text-foreground">Pedidos en curso</h1>
          <p className="text-body-sm text-muted-foreground">
            Sede Centro · Conectado en tiempo real
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-caption text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          WebSocket
        </span>
      </header>

      <div className="grid grid-cols-4 gap-2">
        <Column title="Pendiente" highlighted={highlight === "pending"}>
          {highlight === "pending" && <NewOrderCard />}
        </Column>
        <Column title="Aceptado" highlighted={highlight === "accepted"}>
          {highlight === "accepted" && <ProgressOrderCard state="accepted" />}
        </Column>
        <Column title="Preparando" highlighted={highlight === "preparing"}>
          {highlight === "preparing" && <ProgressOrderCard state="preparing" />}
        </Column>
        <Column title="Listo" highlighted={highlight === "ready"}>
          {highlight === "ready" && <ProgressOrderCard state="ready" />}
        </Column>
      </div>
    </div>
  );
}

function Column({
  title,
  highlighted,
  children,
}: {
  title: string;
  highlighted: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={[
        "min-h-[260px] rounded-xl border bg-surface p-2 transition",
        highlighted ? "border-primary bg-primary/5" : "border-border",
      ].join(" ")}
    >
      <p className="mb-2 px-1 text-caption font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NewOrderCard() {
  return (
    <article className="space-y-1.5 rounded-lg border-2 border-primary bg-background p-2.5 shadow-md animate-fade-in-up">
      <header className="flex items-center justify-between">
        <span className="text-body-sm font-semibold text-foreground">#1042</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary-foreground">
          <Bell size={9} className="animate-pulse" /> Nuevo
        </span>
      </header>
      <p className="text-caption text-muted-foreground">Carlos García</p>
      <ul className="space-y-0.5 text-caption">
        {DEMO_ORDER.items.map((it, i) => (
          <li key={i} className="text-foreground">
            <span className="text-muted-foreground">{it.quantity}×</span> {it.dishName}{" "}
            <span className="text-muted-foreground">({it.variant})</span>
          </li>
        ))}
      </ul>
      <footer className="flex items-center justify-between text-caption text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Bike size={10} /> Domicilio
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={10} /> {DEMO_ORDER.scheduledTime}
        </span>
      </footer>
      <div className="grid grid-cols-2 gap-1 pt-1">
        <button className="rounded-md border border-border bg-surface py-1 text-caption">
          Rechazar
        </button>
        <button className="rounded-md bg-primary py-1 text-caption font-medium text-primary-foreground">
          Aceptar
        </button>
      </div>
    </article>
  );
}

function ProgressOrderCard({
  state,
}: {
  state: "accepted" | "preparing" | "ready";
}) {
  const ACTIONS: Record<typeof state, string> = {
    accepted: "Empezar a preparar",
    preparing: "Marcar listo",
    ready: "Entregado",
  };
  return (
    <article className="space-y-1.5 rounded-lg border border-border bg-background p-2.5 animate-fade-in-up">
      <header className="flex items-center justify-between">
        <span className="text-body-sm font-semibold text-foreground">#1042</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          <Clock size={9} /> {DEMO_ORDER.scheduledTime}
        </span>
      </header>
      <p className="text-caption text-muted-foreground">Carlos García</p>
      <ul className="space-y-0.5 text-caption">
        {DEMO_ORDER.items.map((it, i) => (
          <li key={i} className="text-foreground">
            <span className="text-muted-foreground">{it.quantity}×</span> {it.dishName}
          </li>
        ))}
      </ul>
      <button className="w-full rounded-md bg-primary py-1 text-caption font-medium text-primary-foreground">
        {ACTIONS[state]}
      </button>
    </article>
  );
}
