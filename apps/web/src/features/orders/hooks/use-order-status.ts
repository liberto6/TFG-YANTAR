"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Order } from "../types/order.types";
import { useOrderSocketSubscription } from "@/features/operativo/hooks/use-order-events";

const ACTIVE_STATUSES = new Set(["PENDING", "ACCEPTED", "PREPARING", "READY"]);

export function useOrderStatus(orderId: string) {
  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get<Order>(`/orders/${orderId}`),
    enabled: !!orderId,
    // Fallback polling cada 10s — el WebSocket es el canal principal
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return status && ACTIVE_STATUSES.has(status) ? 10000 : false;
    },
  });

  // Suscripción WebSocket — actualiza la cache sin polling cuando el servidor emite
  useOrderSocketSubscription(orderId);

  return query;
}
