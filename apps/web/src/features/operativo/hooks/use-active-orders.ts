"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Order } from "@/features/orders/types/order.types";
import { useBranchOrderEvents } from "./use-order-events";

export function useActiveOrders(branchId: string | undefined) {
  // Carga inicial via HTTP
  const query = useQuery({
    queryKey: ["active-orders", branchId],
    queryFn: () => api.get<Order[]>(`/admin/orders/active?branchId=${branchId}`),
    enabled: !!branchId,
  });

  // Suscripción WebSocket — actualiza la cache en tiempo real
  useBranchOrderEvents(branchId);

  return query;
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, estimatedMinutes }: { orderId: string; estimatedMinutes: number }) =>
      api.patch<Order>(`/admin/orders/${orderId}/accept`, { estimatedMinutes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-orders"] }),
  });
}

export function useRejectOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      api.patch<Order>(`/admin/orders/${orderId}/reject`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-orders"] }),
  });
}

export function useAdvanceOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, action }: { orderId: string; action: "preparing" | "ready" | "delivered" }) =>
      api.patch<Order>(`/admin/orders/${orderId}/${action}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-orders"] }),
  });
}
