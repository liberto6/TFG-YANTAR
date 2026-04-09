"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useOrderStatus } from "@/features/orders/hooks/use-order-status";
import type { OrderStatus } from "@/features/orders/types/order.types";

const STATUS_STEPS: OrderStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DELIVERED",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Recibido",
  ACCEPTED: "Aceptado",
  PREPARING: "En preparacion",
  READY: "Listo para recoger",
  DELIVERED: "Entregado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

const STATUS_DESCRIPTION: Record<OrderStatus, string> = {
  PENDING: "Tu pedido esta esperando confirmacion del restaurante.",
  ACCEPTED: "El restaurante ha aceptado tu pedido.",
  PREPARING: "El equipo esta preparando tu pedido.",
  READY: "Tu pedido esta listo.",
  DELIVERED: "Pedido completado. Gracias!",
  REJECTED: "El restaurante no pudo aceptar tu pedido.",
  CANCELLED: "Este pedido ha sido cancelado.",
};

function OrderTracker({ status }: { status: OrderStatus }) {
  const isTerminal = status === "REJECTED" || status === "CANCELLED";
  const currentIndex = STATUS_STEPS.indexOf(status);

  if (isTerminal) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-center">
        <p className="font-semibold text-red-700">{STATUS_LABEL[status]}</p>
        <p className="text-sm text-red-600">{STATUS_DESCRIPTION[status]}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        {STATUS_STEPS.map((step, i) => {
          const isCompleted = i <= currentIndex;
          return (
            <div key={step} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? "✓" : i + 1}
              </div>
              <span
                className={`text-center text-[10px] leading-tight ${
                  isCompleted ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {STATUS_LABEL[step]}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {STATUS_DESCRIPTION[status]}
      </p>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useOrderStatus(orderId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-muted-foreground">
          No se pudo cargar el pedido.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Volver a la carta
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Tu pedido</h1>
        <span className="text-xs text-muted-foreground">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Status tracker */}
      <Card>
        <CardContent className="pt-4">
          <OrderTracker status={order.status} />
          {order.scheduledTime && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Hora programada:{" "}
              <span className="font-medium text-foreground">
                {new Date(order.scheduledTime).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          )}
          {order.estimatedMinutes && (
            <p className="mt-1 text-center text-sm font-medium text-foreground">
              Tiempo estimado: {order.estimatedMinutes} min
            </p>
          )}
          {order.rejectionReason && (
            <p className="mt-2 text-center text-sm text-red-600">
              Motivo: {order.rejectionReason}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">Detalle del pedido</h2>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="py-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {item.quantity}x {item.dishName}
                </span>
                <span className="text-muted-foreground">
                  {item.lineTotal.toFixed(2)} €
                </span>
              </div>
              {item.selectedVariant && (
                <p className="text-xs text-muted-foreground">
                  {item.selectedVariant}
                </p>
              )}
              {item.selectedModifiers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  + {item.selectedModifiers.map((m) => m.name).join(", ")}
                </p>
              )}
            </div>
          ))}
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>{order.subtotal.toFixed(2)} €</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Envio</span>
                <span>{order.deliveryFee.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{order.total.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/menu"
        className="inline-flex w-full items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        Seguir pidiendo
      </Link>
    </div>
  );
}
