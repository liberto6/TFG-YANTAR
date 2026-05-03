"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useToast } from "@/lib/toast-provider";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";
import { useBranchOrderEvents } from "./use-order-events";

const ACTIVE_KEY = ["active-orders"] as const;

export function useActiveOrders(branchId: string | undefined) {
  const query = useQuery({
    queryKey: ["active-orders", branchId],
    queryFn: () => api.get<Order[]>(`/admin/orders/active?branchId=${branchId}`),
    enabled: !!branchId,
  });

  useBranchOrderEvents(branchId);

  return query;
}

interface OptimisticContext {
  previous: Array<[readonly unknown[], Order[] | undefined]>;
}

function applyOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  orderId: string,
  patch: Partial<Order>,
): OptimisticContext {
  const matches = queryClient.getQueriesData<Order[]>({ queryKey: ACTIVE_KEY });
  const previous: OptimisticContext["previous"] = [];
  for (const [key, data] of matches) {
    previous.push([key, data]);
    if (!data) continue;
    queryClient.setQueryData<Order[]>(
      key,
      data.map((o) => (o.id === orderId ? { ...o, ...patch } : o)),
    );
  }
  return { previous };
}

function rollback(
  queryClient: ReturnType<typeof useQueryClient>,
  ctx: OptimisticContext | undefined,
) {
  if (!ctx) return;
  for (const [key, data] of ctx.previous) {
    queryClient.setQueryData(key, data);
  }
}

export function useAcceptOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ orderId, estimatedMinutes }: { orderId: string; estimatedMinutes: number }) =>
      api.patch<Order>(`/admin/orders/${orderId}/accept`, { estimatedMinutes }),
    onMutate: ({ orderId, estimatedMinutes }) =>
      applyOptimistic(queryClient, orderId, {
        status: "ACCEPTED" as OrderStatus,
        estimatedMinutes,
      }),
    onError: (err, _vars, ctx) => {
      rollback(queryClient, ctx);
      toast.error("No se pudo aceptar el pedido", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
    onSuccess: () => toast.success("Pedido aceptado"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ACTIVE_KEY }),
  });
}

export function useRejectOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      api.patch<Order>(`/admin/orders/${orderId}/reject`, { reason }),
    onMutate: ({ orderId, reason }) =>
      applyOptimistic(queryClient, orderId, {
        status: "REJECTED" as OrderStatus,
        rejectionReason: reason,
      }),
    onError: (err, _vars, ctx) => {
      rollback(queryClient, ctx);
      toast.error("No se pudo rechazar el pedido", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
    onSuccess: () => toast.info("Pedido rechazado"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ACTIVE_KEY }),
  });
}

const STATUS_BY_ACTION: Record<"preparing" | "ready" | "delivered", OrderStatus> = {
  preparing: "PREPARING",
  ready: "READY",
  delivered: "DELIVERED",
};

const SUCCESS_MESSAGE: Record<"preparing" | "ready" | "delivered", string> = {
  preparing: "Pedido en preparación",
  ready: "Pedido marcado como listo",
  delivered: "Pedido entregado",
};

export function useAdvanceOrderStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ orderId, action }: { orderId: string; action: "preparing" | "ready" | "delivered" }) =>
      api.patch<Order>(`/admin/orders/${orderId}/${action}`, {}),
    onMutate: ({ orderId, action }) =>
      applyOptimistic(queryClient, orderId, { status: STATUS_BY_ACTION[action] }),
    onError: (err, _vars, ctx) => {
      rollback(queryClient, ctx);
      toast.error("No se pudo actualizar el pedido", {
        description: err instanceof Error ? err.message : undefined,
      });
    },
    onSuccess: (_data, vars) => toast.success(SUCCESS_MESSAGE[vars.action]),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ACTIVE_KEY }),
  });
}
