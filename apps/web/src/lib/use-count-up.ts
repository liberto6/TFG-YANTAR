"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  duration?: number;
  decimals?: number;
}

/**
 * Anima un número desde 0 (o desde el valor anterior) hasta el destino.
 * Respeta prefers-reduced-motion (devuelve directamente el valor final).
 * Easing: cubic-bezier(0.16, 1, 0.3, 1) — ease-out-expo natural.
 */
export function useCountUp(target: number, { duration = 700, decimals = 0 }: UseCountUpOptions = {}) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = from + (to - from) * eased;
      const factor = Math.pow(10, decimals);
      setValue(Math.round(current * factor) / factor);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, decimals]);

  return value;
}
