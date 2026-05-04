"use client";

import type { ReactNode } from "react";
import { useRevealOnScroll } from "../hooks/use-reveal-on-scroll";

/**
 * Wrapper que anima la entrada de su contenido cuando entra en viewport.
 * Usa Intersection Observer y solo dispara la animación una vez.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Delay en ms antes de mostrar. Útil para coreografías escalonadas. */
  delay?: number;
  className?: string;
}) {
  const [ref, isVisible] = useRevealOnScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={[
        "transition-all duration-700 ease-out-expo",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0",
        className,
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
