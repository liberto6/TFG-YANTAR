"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useCompanyConfig } from "@/features/company/hooks/use-company-config";
import type { Dish } from "../types/menu.types";

export function useDishDetail(dishId: string) {
  const { data: config } = useCompanyConfig();
  const companyId = config?.id;

  return useQuery({
    queryKey: ["dish", companyId, dishId],
    queryFn: () => api.get<Dish>(`/menu/${companyId}/dishes/${dishId}`),
    enabled: !!dishId && !!companyId,
    staleTime: 5 * 60 * 1000,
  });
}
