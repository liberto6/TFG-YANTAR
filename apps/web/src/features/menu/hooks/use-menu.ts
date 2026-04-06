"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { MenuResponse } from "../types/menu.types";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID!;

export function useMenu(excludeAllergens: string[] = []) {
  const excludeParam =
    excludeAllergens.length > 0 ? `?exclude=${excludeAllergens.join(",")}` : "";

  return useQuery({
    queryKey: ["menu", COMPANY_ID, excludeAllergens],
    queryFn: () =>
      api.get<MenuResponse>(`/menu/${COMPANY_ID}${excludeParam}`),
    staleTime: 5 * 60 * 1000,
  });
}
