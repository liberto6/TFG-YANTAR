"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTenantSlug } from "@/features/tenant/context/tenant-context";

export interface CompanyConfig {
  id: string;
  name: string;
  slug: string;
  appName: string | null;
  logoUrl: string | null;
  welcomeMessage: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  colorAccent: string | null;
  colorBackground: string | null;
  colorSurface: string | null;
  colorText: string | null;
  colorTextMuted: string | null;
}

/**
 * Carga la configuración pública de la empresa a partir del slug del tenant
 * actual (resuelto por el middleware en runtime). Se cachea indefinidamente
 * dentro de la sesión porque la configuración cambia raras veces.
 */
export function useCompanyConfig() {
  const slug = useTenantSlug();
  return useQuery<CompanyConfig>({
    queryKey: ["company-config", slug],
    queryFn: () => api.get<CompanyConfig>(`/companies/${slug}/config`),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
