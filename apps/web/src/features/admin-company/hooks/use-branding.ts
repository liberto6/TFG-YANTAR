"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface CompanyConfig {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  fontFamily: string | null;
  colorPrimary: string | null;
  colorSecondary: string | null;
  colorAccent: string | null;
  colorBackground: string | null;
  colorSurface: string | null;
  colorText: string | null;
  colorTextMuted: string | null;
  welcomeMessage: string | null;
  appName: string | null;
}

export interface UpdateBrandingData {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  fontFamily?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  colorAccent?: string | null;
  colorBackground?: string | null;
  colorSurface?: string | null;
  colorText?: string | null;
  colorTextMuted?: string | null;
  welcomeMessage?: string | null;
  appName?: string | null;
}

export function useCompanyConfig() {
  return useQuery({
    queryKey: ["company-config"],
    queryFn: () => api.get<CompanyConfig>("/admin/company/config"),
  });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBrandingData) =>
      api.patch<CompanyConfig>("/admin/company/branding", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-config"] }),
  });
}
