"use client";

import { useEffect, useState } from "react";
import { DemoChapter } from "../components/DemoChapter";
import { DemoMockShell } from "../components/DemoMockShell";
import { KanbanShellReal } from "./14-operativo-receive";

/**
 * Paso 15 — El cocinero avanza el pedido. Cicla automáticamente entre los
 * tres estados (aceptado → preparando → listo) cada 2.5 s para que se vea
 * la transición visual del kanban.
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
      <DemoMockShell>
        <KanbanShellReal highlight={current} />
      </DemoMockShell>
    </DemoChapter>
  );
}
