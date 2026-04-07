"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID!;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", ACCEPTED: "Aceptado", PREPARING: "Preparando",
  READY: "Listo", DELIVERED: "Entregado", REJECTED: "Rechazado", CANCELLED: "Cancelado",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700", READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-gray-100 text-gray-600", REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const NEXT_ACTIONS: Partial<Record<OrderStatus, { label: string; endpoint: string }[]>> = {
  PENDING: [
    { label: "Aceptar", endpoint: "accept" },
    { label: "Rechazar", endpoint: "reject" },
  ],
  ACCEPTED: [{ label: "Preparando", endpoint: "preparing" }],
  PREPARING: [{ label: "Listo", endpoint: "ready" }],
  READY: [{ label: "Entregado", endpoint: "delivered" }],
};

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-active-orders", BRANCH_ID],
    queryFn: () => api.get<Order[]>(`/admin/orders/active?branchId=${BRANCH_ID}`),
    refetchInterval: 10000,
    enabled: !!BRANCH_ID,
  });

  const actionMutation = useMutation({
    mutationFn: ({ orderId, endpoint }: { orderId: string; endpoint: string }) =>
      api.patch(`/admin/orders/${orderId}/${endpoint}`, { estimatedMinutes: 20, reason: "No disponible" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-active-orders"] }),
  });

  const filtered = orders?.filter((o) => {
    if (statusFilter === "active") return ["PENDING","ACCEPTED","PREPARING","READY"].includes(o.status);
    if (statusFilter === "done") return ["DELIVERED","REJECTED","CANCELLED"].includes(o.status);
    return true;
  }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Pedidos</h2>
        <p className="text-sm text-muted-foreground">Gestiona los pedidos de tu restaurante</p>
      </div>

      <div className="flex gap-2">
        {["active", "done", "all"].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={statusFilter === f ? "default" : "outline"}
            onClick={() => setStatusFilter(f)}
          >
            {{ active: "Activos", done: "Finalizados", all: "Todos" }[f]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No hay pedidos en esta vista</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">#{order.id.slice(0,8).toUpperCase()}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.deliveryMode === "DELIVERY" ? "Delivery" : "Recogida"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {order.items.map((i) => `${i.quantity}x ${i.dishName}`).join(", ")}
                    </div>
                    <p className="mt-1 text-sm font-semibold">{order.total.toFixed(2)} €</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {NEXT_ACTIONS[order.status as OrderStatus]?.map((action) => (
                      <Button
                        key={action.endpoint}
                        size="sm"
                        variant={action.endpoint === "reject" ? "ghost" : "default"}
                        className={action.endpoint === "reject" ? "text-destructive hover:text-destructive" : ""}
                        onClick={() => actionMutation.mutate({ orderId: order.id, endpoint: action.endpoint })}
                        disabled={actionMutation.isPending}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
