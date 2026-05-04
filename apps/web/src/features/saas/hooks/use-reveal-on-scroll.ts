"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook de reveal-on-scroll. Devuelve un ref y un booleano `isVisible` que
 * pasa a `true` cuando el elemento entra en el viewport (ratio configurable)
 * y se queda en `true` para que la animación no se repita al hacer scroll
 * arriba/abajo.
 *
 * Pensado para coreografiar entradas suaves en secciones largas, sin
 * librerías externas tipo Framer/GSAP.
 */
export function useRevealOnScroll<T extends HTMLElement>(
  options: { threshold?: number; rootMargin?: string } = {},
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? "0px 0px -10% 0px",
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
}
