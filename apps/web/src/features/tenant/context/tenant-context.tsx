"use client";

import { createContext, useContext, ReactNode } from "react";

interface TenantContextValue {
  slug: string;
}

const TenantContext = createContext<TenantContextValue | null>(null);

/**
 * Inyecta el slug del tenant a los componentes cliente. El slug se resuelve en
 * el middleware Next.js a partir del Host y se pasa por SSR a este provider;
 * los hooks usan `useTenantSlug()` para acceder a él en runtime.
 */
export function TenantProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ slug }}>{children}</TenantContext.Provider>
  );
}

export function useTenantSlug(): string {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenantSlug debe usarse dentro de un TenantProvider");
  }
  return ctx.slug;
}
