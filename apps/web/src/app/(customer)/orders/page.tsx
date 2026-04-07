"use client";

import Link from "next/link";
import { useOrderHistory } from "@/features/orders/hooks/use-order-history";
import type { OrderStatus } from "@/features/orders/types/order.types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptado",
  PREPARING: "Preparando",
  READY: "Listo",
  DELIVERED: "Entregado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-gray-100 text-gray-600",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrderHistory();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Mis pedidos</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : !orders?.length ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-muted-foreground">Aún no tienes pedidos.</p>
          <Link
            href="/menu"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Ver la carta
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-border bg-background p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.map((i) => `${i.quantity}× ${i.dishName}`).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">{order.total.toFixed(2)} €</p>
                  <p className="text-xs text-muted-foreground">
                    {order.deliveryMode === "DELIVERY" ? "Domicilio" : "Recogida"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
