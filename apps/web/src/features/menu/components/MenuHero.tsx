"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCompanyConfig } from "@/features/company/hooks/use-company-config";

/**
 * Hero del menú con foto de fondo y parallax suave al scroll.
 *
 * Si la empresa tiene `logoUrl`, se usa como imagen del hero. Si no, se
 * pinta un gradiente con la paleta de marca como fallback. El parallax
 * mueve la imagen de fondo a la mitad de velocidad que el scroll para
 * dar sensación de profundidad sin librerías.
 */
export function MenuHero() {
  const { data: config } = useCompanyConfig();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Solo actualiza si el hero está cerca del viewport (perf).
      if (rect.bottom < -50 || rect.top > window.innerHeight + 50) return;
      // Parallax suave: la imagen se mueve a la mitad de la velocidad del scroll.
      setOffset(-rect.top * 0.4);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const name = config?.appName ?? config?.name;
  const welcome = config?.welcomeMessage;
  const logo = config?.logoUrl;

  return (
    <div
      ref={ref}
      className="relative -mx-4 mb-2 h-44 overflow-hidden rounded-b-2xl bg-primary sm:h-56"
    >
      {/* Capa imagen / gradiente con parallax */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate3d(0, ${offset}px, 0) scale(1.1)` }}
        aria-hidden
      >
        {logo ? (
          <Image
            src={logo}
            alt=""
            fill
            priority
            className="object-cover opacity-70"
            sizes="100vw"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(120% 80% at 30% 20%, hsl(var(--primary)) 0%, hsl(var(--accent) / 0.6) 60%, hsl(var(--primary) / 0.7) 100%)`,
            }}
          />
        )}
      </div>

      {/* Overlay con gradient para legibilidad del texto */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
        aria-hidden
      />

      {/* Texto */}
      <div className="absolute inset-x-0 bottom-0 px-5 py-4 text-white">
        <p className="text-caption uppercase tracking-wider opacity-80">Carta</p>
        <h1 className="text-h1 leading-tight drop-shadow-md">
          {name ?? "Restaurante"}
        </h1>
        {welcome && (
          <p className="mt-1 line-clamp-2 max-w-md text-body-sm opacity-90 drop-shadow">
            {welcome}
          </p>
        )}
      </div>
    </div>
  );
}
