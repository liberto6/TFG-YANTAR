"use client";

import { Bell } from "lucide-react";
import { OrderKanbanCard } from "@/features/operativo/components/OrderKanbanCard";
import { DemoChapter } from "../components/DemoChapter";
import { DemoMockShell } from "../components/DemoMockShell";
import { NAPOLI_KANBAN_ORDER } from "../data/napoli-fixtures";

/**
 * Paso 14 — La cocina recibe el pedido en tiempo real. Usa el componente
 * real `<OrderKanbanCard>` montado dentro del DemoMockShell, así la tarjeta
 * que ve el tribunal es exactamente la misma que verá el operario en
 * producción (con sus mismos botones, estilos y comportamiento al hacer
 * click).
 */
export function Step14OperativoReceive() {
  return (
    <DemoChapter url="napoli.yantar.app/operativo" device="tablet">
      <DemoMockShell>
        <KanbanShellReal highlight="pending" />
      </DemoMockShell>
    </DemoChapter>
  );
}

export function KanbanShellReal({
  highlight,
}: {
  highlight: "pending" | "accepted" | "preparing" | "ready";
}) {
  const STATUS_BY_COL: Record<typeof highlight, string> = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    preparing: "PREPARING",
    ready: "READY",
  };

  // Cada columna recibe el pedido en su estado correspondiente cuando le
  // toca destacar; las demás quedan vacías.
  const order = {
    ...NAPOLI_KANBAN_ORDER,
    status: STATUS_BY_COL[highlight] as typeof NAPOLI_KANBAN_ORDER.status,
  };

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
          {highlight === "pending" && (
            <div className="relative animate-fade-in-up">
              <span className="absolute -right-1 -top-1 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary-foreground shadow-md">
                <Bell size={9} className="animate-pulse" /> Nuevo
              </span>
              <OrderKanbanCard order={order} />
            </div>
          )}
        </Column>
        <Column title="Aceptado" highlighted={highlight === "accepted"}>
          {highlight === "accepted" && (
            <div className="animate-fade-in-up">
              <OrderKanbanCard order={order} />
            </div>
          )}
        </Column>
        <Column title="Preparando" highlighted={highlight === "preparing"}>
          {highlight === "preparing" && (
            <div className="animate-fade-in-up">
              <OrderKanbanCard order={order} />
            </div>
          )}
        </Column>
        <Column title="Listo" highlighted={highlight === "ready"}>
          {highlight === "ready" && (
            <div className="animate-fade-in-up">
              <OrderKanbanCard order={order} />
            </div>
          )}
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
        "min-h-[280px] rounded-xl border bg-surface p-2 transition",
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
