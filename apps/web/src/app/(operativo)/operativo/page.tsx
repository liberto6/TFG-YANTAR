"use client";

import { useActiveOrders } from "@/features/operativo/hooks/use-active-orders";
import { OrderKanbanCard } from "@/features/operativo/components/OrderKanbanCard";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

const COLUMNS: { status: OrderStatus; label: string; color: string }[] = [
  { status: "PENDING", label: "Pendientes", color: "border-yellow-400" },
  { status: "ACCEPTED", label: "Aceptados", color: "border-blue-400" },
  { status: "PREPARING", label: "Preparando", color: "border-orange-400" },
  { status: "READY", label: "Listos", color: "border-green-400" },
];

export default function OperativoPage() {
  const branchId = process.env.NEXT_PUBLIC_BRANCH_ID;
  const { data: orders, isLoading } = useActiveOrders(branchId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="space-y-3">
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            {[1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const ordersByStatus = (status: OrderStatus): Order[] =>
    (orders ?? []).filter((o) => o.status === status);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const colOrders = ordersByStatus(col.status);
        return (
          <div key={col.status} className="space-y-3">
            <div className={`flex items-center gap-2 border-b-2 pb-2 ${col.color}`}>
              <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
              {colOrders.length > 0 && (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {colOrders.length}
                </span>
              )}
            </div>
            {colOrders.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">Sin pedidos</p>
            ) : (
              colOrders.map((order) => (
                <OrderKanbanCard key={order.id} order={order} />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
