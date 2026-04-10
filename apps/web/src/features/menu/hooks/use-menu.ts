"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useCompanyConfig } from "@/features/company/hooks/use-company-config";
import type { MenuResponse } from "../types/menu.types";

export function useMenu(excludeAllergens: string[] = []) {
  const { data: config } = useCompanyConfig();
  const companyId = config?.id;
  const excludeParam =
    excludeAllergens.length > 0 ? `?exclude=${excludeAllergens.join(",")}` : "";

  return useQuery({
    queryKey: ["menu", companyId, excludeAllergens],
    queryFn: () => api.get<MenuResponse>(`/menu/${companyId}${excludeParam}`),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
