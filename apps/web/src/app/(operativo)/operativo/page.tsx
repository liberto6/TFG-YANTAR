"use client";

import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CalmKitchenIllustration } from "@/components/illustrations";
import { cn } from "@/lib/cn";
import { useActiveOrders } from "@/features/operativo/hooks/use-active-orders";
import { OrderKanbanCard } from "@/features/operativo/components/OrderKanbanCard";
import { BranchSelectorBar } from "@/features/operativo/components/BranchSelectorBar";
import { KitchenKPIs } from "@/features/operativo/components/KitchenKPIs";
import { useSelectedBranch } from "@/features/operativo/hooks/use-selected-branch";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

const COLUMNS: {
  status: OrderStatus;
  label: string;
  accentClass: string;
  pulseOnNew?: boolean;
}[] = [
  { status: "PENDING", label: "Pendientes", accentClass: "bg-warning", pulseOnNew: true },
  { status: "ACCEPTED", label: "Aceptados", accentClass: "bg-info" },
  { status: "PREPARING", label: "Preparando", accentClass: "bg-primary" },
  { status: "READY", label: "Listos", accentClass: "bg-success" },
];

export default function OperativoPage() {
  const { selectedBranchId } = useSelectedBranch();
  const { data: orders, isLoading } = useActiveOrders(selectedBranchId ?? undefined);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="space-y-3">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const ordersByStatus = (status: OrderStatus): Order[] =>
    (orders ?? []).filter((o) => o.status === status);

  const totalActive = (orders ?? []).length;

  if (totalActive === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-h2 text-foreground">En curso</h2>
          <BranchSelectorBar />
        </div>
        <EmptyState
          illustration={<CalmKitchenIllustration />}
          title="Cocina tranquila por ahora"
          description="Los nuevos pedidos aparecerán aquí en tiempo real. Aprovecha para descansar o preparar mise en place."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-h2 text-foreground">En curso</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <KitchenKPIs orders={orders ?? []} />
          <BranchSelectorBar />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const colOrders = ordersByStatus(col.status);
          const hasNew = col.pulseOnNew && colOrders.length > 0;
          return (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", col.accentClass, hasNew && "animate-pulse-soft")} />
                <h3 className="text-body font-semibold text-foreground">{col.label}</h3>
                <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-caption font-medium text-muted-foreground">
                  {colOrders.length}
                </span>
              </div>

              {colOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-border py-6 text-center">
                  <Inbox size={18} className="text-muted-foreground" />
                  <p className="text-caption text-muted-foreground">Sin pedidos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {colOrders.map((order) => (
                    <OrderKanbanCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
