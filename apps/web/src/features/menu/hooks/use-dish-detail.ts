"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Dish } from "../types/menu.types";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID!;

export function useDishDetail(dishId: string) {
  return useQuery({
    queryKey: ["dish", COMPANY_ID, dishId],
    queryFn: () =>
      api.get<Dish>(`/menu/${COMPANY_ID}/dishes/${dishId}`),
    enabled: !!dishId,
    staleTime: 5 * 60 * 1000,
  });
}
