"use client";

import { Construction } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";

/**
 * Placeholder reutilizable para los pasos que aún no tienen su visual real.
 * Permite que la demo funcione end-to-end mientras se itera paso a paso.
 */
export function StubStep({
  url,
  device = "desktop",
  label,
}: {
  url: string;
  device?: "desktop" | "tablet" | "mobile";
  label: string;
}) {
  return (
    <DemoChapter url={url} device={device}>
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
          <Construction size={24} />
        </span>
        <h3 className="text-h3 text-foreground">{label}</h3>
        <p className="max-w-sm text-body-sm text-muted-foreground">
          Vista en construcción. La demo cubrirá esta pantalla en cuanto se
          monte el componente real.
        </p>
      </div>
    </DemoChapter>
  );
}
