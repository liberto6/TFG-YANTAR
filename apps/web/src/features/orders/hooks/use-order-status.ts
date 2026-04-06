"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Order } from "../types/order.types";

const ACTIVE_STATUSES = new Set(["PENDING", "ACCEPTED", "PREPARING", "READY"]);

export function useOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get<Order>(`/orders/${orderId}`),
    enabled: !!orderId,
    // Poll every 5s while order is active
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.has(status) ? 5000 : false;
    },
  });
}
