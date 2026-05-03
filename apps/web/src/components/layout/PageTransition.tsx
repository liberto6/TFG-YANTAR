"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Re-monta el contenido en cada cambio de pathname y dispara la animación
 * de entrada. Sutil, sin overshoot, 200ms.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in-up">
      {children}
    </div>
  );
}
