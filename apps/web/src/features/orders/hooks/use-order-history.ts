"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Order } from "../types/order.types";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function useOrderHistory() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["order-history"],
    queryFn: () => api.get<Order[]>("/orders/history"),
    enabled: isAuthenticated,
  });
}
