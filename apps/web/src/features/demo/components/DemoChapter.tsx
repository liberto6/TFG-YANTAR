"use client";

import type { ReactNode } from "react";
import { BrowserFrame } from "./BrowserFrame";

/**
 * Wrapper visual de un paso. Encierra el visual del paso dentro de un
 * BrowserFrame con la URL del paso, y aplica una animación de entrada.
 */
export function DemoChapter({
  url,
  device = "desktop",
  children,
}: {
  url: string;
  device?: "desktop" | "tablet" | "mobile";
  children: ReactNode;
}) {
  return (
    <div className="animate-fade-in-up">
      <BrowserFrame url={url} device={device}>
        {children}
      </BrowserFrame>
    </div>
  );
}
