"use client";

import { useEffect, useState } from "react";
import { DemoChapter } from "../components/DemoChapter";
import { KanbanShell } from "./14-operativo-receive";

/**
 * Paso 15 — El cocinero acepta el pedido y lo va avanzando por el kanban.
 * El componente cicla automáticamente entre los 3 estados para que la
 * transición sea visible mientras dura el paso.
 */
export function Step15OperativoProgress() {
  const states = ["accepted", "preparing", "ready"] as const;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % states.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [states.length]);

  const current = states[idx]!;

  return (
    <DemoChapter url="napoli.yantar.app/operativo" device="tablet">
      <KanbanShell highlight={current} />
    </DemoChapter>
  );
}
