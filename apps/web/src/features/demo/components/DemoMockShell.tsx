"use client";

import {
  QueryClient,
  QueryClientProvider,
  type QueryClient as QueryClientType,
} from "@tanstack/react-query";
import { useEffect, useMemo, type ReactNode } from "react";
import { TenantProvider } from "@/features/tenant/context/tenant-context";
import { ToastProvider } from "@/lib/toast-provider";
import { DEMO_TENANT_SLUG } from "../data/napoli-fixtures";

export interface SeedEntry {
  /** queryKey con el que se identificará el dato en la cache. */
  key: readonly unknown[];
  /** Dato a inyectar (debe coincidir con el shape que espera el hook). */
  data: unknown;
}

/**
 * Shell para montar componentes reales (los mismos de la app de producción)
 * dentro de un paso de la demo.
 *
 * Setea un `QueryClient` propio con queries pre-seedadas, intercepta `fetch`
 * sobre el backend (para que mutations no peguen contra el servidor real
 * cuando se hagan clicks) y monta los providers indispensables: TenantProvider
 * (para hooks que llaman `useTenantSlug`) y ToastProvider (necesario para
 * algunos hooks de mutation que muestran toasts).
 */
export function DemoMockShell({
  seed,
  children,
}: {
  seed?: SeedEntry[];
  children: ReactNode;
}) {
  const client = useMemo<QueryClientType>(() => {
    const c = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
        mutations: { retry: false },
      },
    });
    return c;
  }, []);

  // Seedea cache cada vez que cambien los datos (la lista de seed se
  // estabiliza por referencia desde fixtures, así que en práctica solo se
  // ejecuta una vez por step montado).
  useEffect(() => {
    if (!seed) return;
    for (const entry of seed) {
      client.setQueryData(entry.key, entry.data);
    }
  }, [client, seed]);

  // Intercepta fetch hacia el backend mientras este shell está montado.
  // Devuelve 200 OK con un body vacío para que las mutations no expongan
  // errores en la demo (los toasts de éxito siguen apareciendo).
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.startsWith(apiBase)) {
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return originalFetch(input as RequestInfo, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <QueryClientProvider client={client}>
      <TenantProvider slug={DEMO_TENANT_SLUG}>
        <ToastProvider>{children}</ToastProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}
