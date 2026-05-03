"use client";

import { useEffect, useState } from "react";

export interface CursorWaypoint {
  /** Coordenada X dentro del contenedor `relative` que envuelve al cursor. */
  x: number;
  /** Coordenada Y dentro del contenedor `relative`. */
  y: number;
  /** Delay (ms) antes de moverse a este punto. */
  delay: number;
  /** Si true, dispara una animación de "click" al llegar. */
  click?: boolean;
}

/**
 * Cursor virtual posicionado en absolute dentro de un wrapper `relative`.
 * Recorre la lista de waypoints encadenando setTimeout. Se reinicia cuando
 * cambia la prop `script` (o cuando el componente se remonta entre pasos).
 */
export function DemoCursor({
  script,
  initial,
}: {
  script: CursorWaypoint[];
  initial?: { x: number; y: number };
}) {
  const [pos, setPos] = useState(initial ?? script[0] ?? { x: 0, y: 0 });
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (const wp of script) {
      elapsed += wp.delay;
      const moveAt = elapsed;
      timers.push(
        setTimeout(() => {
          setPos({ x: wp.x, y: wp.y });
          if (wp.click) {
            const clickT = setTimeout(() => {
              setClicking(true);
              const offT = setTimeout(() => setClicking(false), 250);
              timers.push(offT);
            }, 380);
            timers.push(clickT);
          }
        }, moveAt),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [script]);

  return (
    <div
      className="pointer-events-none absolute z-30 transition-all duration-[380ms] ease-out"
      style={{ left: pos.x, top: pos.y, transform: "translate(-3px, -3px)" }}
      aria-hidden
    >
      {clicking && (
        <span
          className="absolute -left-3 -top-3 h-7 w-7 animate-ping rounded-full bg-primary/40"
          style={{ animationDuration: "350ms", animationIterationCount: 1 }}
        />
      )}
      <svg width="22" height="24" viewBox="0 0 22 24" className="drop-shadow-md">
        <path
          d="M2 2 L2 18 L7 14 L10 21 L13 20 L10 13 L17 13 Z"
          fill="white"
          stroke="#0f172a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
