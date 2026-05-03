"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bike, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyOrdersIllustration } from "@/components/illustrations";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
} from "@/lib/order-status";
import { BranchSelectorBar } from "@/features/operativo/components/BranchSelectorBar";
import { useSelectedBranch } from "@/features/operativo/hooks/use-selected-branch";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

type StatusFilter = "active" | "done" | "all";

const FILTER_LABEL: Record<StatusFilter, string> = {
  active: "Activos",
  done: "Finalizados",
  all: "Todos",
};

const NEXT_ACTIONS: Partial<
  Record<OrderStatus, { label: string; endpoint: string; variant: "default" | "outline" | "destructive" }[]>
> = {
  PENDING: [
    { label: "Aceptar", endpoint: "accept", variant: "default" },
    { label: "Rechazar", endpoint: "reject", variant: "outline" },
  ],
  ACCEPTED: [{ label: "Empezar preparación", endpoint: "preparing", variant: "default" }],
  PREPARING: [{ label: "Marcar listo", endpoint: "ready", variant: "default" }],
  READY: [{ label: "Marcar entregado", endpoint: "delivered", variant: "default" }],
};

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const { selectedBranchId } = useSelectedBranch();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-active-orders", selectedBranchId],
    queryFn: () => api.get<Order[]>(`/admin/orders/active?branchId=${selectedBranchId}`),
    refetchInterval: 10000,
    enabled: !!selectedBranchId,
  });

  const actionMutation = useMutation({
    mutationFn: ({ orderId, endpoint }: { orderId: string; endpoint: string }) =>
      api.patch(`/admin/orders/${orderId}/${endpoint}`, {
        estimatedMinutes: 20,
        reason: "No disponible",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-active-orders"] }),
  });

  const filtered =
    orders?.filter((o) => {
      if (statusFilter === "active")
        return ["PENDING", "ACCEPTED", "PREPARING", "READY"].includes(o.status);
      if (statusFilter === "done")
        return ["DELIVERED", "REJECTED", "CANCELLED"].includes(o.status);
      return true;
    }) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Pedidos</h2>
          <p className="text-body-sm text-muted-foreground">
            Gestiona los pedidos de tu restaurante
          </p>
        </div>
        <BranchSelectorBar />
      </div>

      <div
        role="tablist"
        aria-label="Filtrar pedidos"
        className="inline-flex rounded-lg border border-border bg-surface p-1"
      >
        {(Object.keys(FILTER_LABEL) as StatusFilter[]).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={statusFilter === f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              "rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors",
              statusFilter === f
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration={<EmptyOrdersIllustration />}
          title="Nada por aquí"
          description={
            statusFilter === "active"
              ? "No hay pedidos activos en esta sede ahora mismo."
              : statusFilter === "done"
                ? "No hay pedidos finalizados en esta sede todavía."
                : "Esta sede no tiene pedidos aún."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const ModeIcon = order.deliveryMode === "DELIVERY" ? Bike : ShoppingBag;
            return (
              <Card key={order.id}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-body font-semibold">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <Badge
                        variant={ORDER_STATUS_VARIANT[order.status as OrderStatus]}
                        dot
                      >
                        {ORDER_STATUS_LABEL[order.status as OrderStatus]}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-caption text-muted-foreground">
                        <ModeIcon size={12} />
                        {order.deliveryMode === "DELIVERY" ? "Domicilio" : "Recogida"}
                      </span>
                    </div>
                    <div className="text-body-sm text-muted-foreground line-clamp-2">
                      {order.items.map((i) => `${i.quantity}× ${i.dishName}`).join(", ")}
                    </div>
                    <p className="text-body font-semibold tabular-nums">
                      {order.total.toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
                    {NEXT_ACTIONS[order.status as OrderStatus]?.map((action) => (
                      <Button
                        key={action.endpoint}
                        size="sm"
                        variant={action.variant}
                        loading={actionMutation.isPending}
                        onClick={() =>
                          actionMutation.mutate({
                            orderId: order.id,
                            endpoint: action.endpoint,
                          })
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
