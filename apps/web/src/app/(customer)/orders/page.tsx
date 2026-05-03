"use client";

import Link from "next/link";
import { Bike, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyOrdersIllustration } from "@/components/illustrations";
import { useOrderHistory } from "@/features/orders/hooks/use-order-history";
import type { OrderStatus } from "@/features/orders/types/order.types";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
} from "@/lib/order-status";

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrderHistory();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-h1 text-foreground">Mis pedidos</h1>
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-h1 text-foreground">Mis pedidos</h1>
        <EmptyState
          illustration={<EmptyOrdersIllustration />}
          title="Tu primer pedido te está esperando"
          description="Cuando hagas un pedido lo verás aquí, con su estado en tiempo real y todos los detalles a mano."
          action={
            <Link
              href="/menu"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Ver la carta
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-h1 text-foreground">Mis pedidos</h1>
      <div className="space-y-3">
        {orders.map((order, i) => {
          const ModeIcon = order.deliveryMode === "DELIVERY" ? Bike : ShoppingBag;
          const variant = ORDER_STATUS_VARIANT[order.status as OrderStatus];
          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              style={{ ["--i" as any]: i, animationDelay: `${i * 60}ms` }}
              className="hover-lift block rounded-xl border border-border bg-surface p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in-up"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body-sm font-medium text-foreground">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <Badge variant={variant} dot>
                      {ORDER_STATUS_LABEL[order.status as OrderStatus]}
                    </Badge>
                  </div>
                  <p className="text-caption text-muted-foreground line-clamp-1">
                    {order.items.map((i) => `${i.quantity}× ${i.dishName}`).join(", ")}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-body font-semibold text-foreground tabular-nums">
                    {order.total.toFixed(2)} €
                  </p>
                  <p className="inline-flex items-center gap-1 text-caption text-muted-foreground">
                    <ModeIcon size={12} />
                    {order.deliveryMode === "DELIVERY" ? "Domicilio" : "Recogida"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
