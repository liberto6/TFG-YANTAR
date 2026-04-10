"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

const COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG!;

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
 * Fetches company config using the public slug.
 * Cached indefinitely for the session — config changes are rare.
 * Provides companyId without needing NEXT_PUBLIC_COMPANY_ID env var.
 */
export function useCompanyConfig() {
  return useQuery<CompanyConfig>({
    queryKey: ["company-config", COMPANY_SLUG],
    queryFn: () => api.get<CompanyConfig>(`/companies/${COMPANY_SLUG}/config`),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
