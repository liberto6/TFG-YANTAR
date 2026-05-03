"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
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
  PREPARING: "En preparación",
  READY: "Listo para recoger",
  DELIVERED: "Entregado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

const STATUS_DESCRIPTION: Record<OrderStatus, string> = {
  PENDING: "Tu pedido está esperando confirmación del restaurante.",
  ACCEPTED: "El restaurante ha aceptado tu pedido.",
  PREPARING: "El equipo está preparando tu pedido.",
  READY: "Tu pedido está listo.",
  DELIVERED: "Pedido completado. ¡Gracias!",
  REJECTED: "El restaurante no pudo aceptar tu pedido.",
  CANCELLED: "Este pedido ha sido cancelado.",
};

function OrderTracker({ status }: { status: OrderStatus }) {
  const isTerminal = status === "REJECTED" || status === "CANCELLED";
  const currentIndex = STATUS_STEPS.indexOf(status);

  if (isTerminal) {
    return (
      <Alert variant="danger" heading={STATUS_LABEL[status]}>
        {STATUS_DESCRIPTION[status]}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start">
        {STATUS_STEPS.map((step, i) => {
          const isCompleted = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/20",
                  )}
                >
                  {isCompleted ? <Check size={16} /> : <Circle size={10} />}
                </div>
                <span
                  className={cn(
                    "text-center text-caption leading-tight",
                    isCompleted ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {STATUS_LABEL[step]}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mt-4 h-0.5 flex-1 transition-colors",
                    i < currentIndex ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-body-sm text-muted-foreground">
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
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-body-sm text-muted-foreground">No se pudo cargar el pedido.</p>
        <Link
          href="/menu"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-transparent px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Volver a la carta
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-foreground">Tu pedido</h1>
        <span className="text-caption text-muted-foreground">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <OrderTracker status={order.status} />
          {order.scheduledTime && (
            <p className="text-center text-body-sm text-muted-foreground">
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
            <p className="text-center text-body-sm font-medium text-foreground">
              Tiempo estimado: {order.estimatedMinutes} min
            </p>
          )}
          {order.rejectionReason && (
            <p className="text-center text-body-sm text-danger">
              Motivo: {order.rejectionReason}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-h3 text-foreground">Detalle del pedido</h2>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="py-2 first:pt-0 last:pb-0">
              <div className="flex justify-between text-body-sm">
                <span className="font-medium">
                  <span className="text-muted-foreground">{item.quantity}×</span> {item.dishName}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {item.lineTotal.toFixed(2)} €
                </span>
              </div>
              {item.selectedVariant && (
                <p className="text-caption text-muted-foreground">{item.selectedVariant}</p>
              )}
              {item.selectedModifiers.length > 0 && (
                <p className="text-caption text-muted-foreground">
                  + {item.selectedModifiers.map((m) => m.name).join(", ")}
                </p>
              )}
            </div>
          ))}
          <div className="space-y-1 pt-3">
            <div className="flex justify-between text-body-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{order.subtotal.toFixed(2)} €</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-body-sm text-muted-foreground">
                <span>Envío</span>
                <span className="tabular-nums">{order.deliveryFee.toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-body font-semibold">
              <span>Total</span>
              <span className="text-primary tabular-nums">{order.total.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/menu"
        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-transparent px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        Seguir pidiendo
      </Link>
    </div>
  );
}
