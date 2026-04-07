"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/features/orders/types/order.types";
import { useAcceptOrder, useRejectOrder, useAdvanceOrderStatus } from "../hooks/use-active-orders";

interface OrderKanbanCardProps {
  order: Order;
}

export function OrderKanbanCard({ order }: OrderKanbanCardProps) {
  const acceptMutation = useAcceptOrder();
  const rejectMutation = useRejectOrder();
  const advanceMutation = useAdvanceOrderStatus();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);

  const createdAt = new Date(order.createdAt);
  const timeAgo = Math.round((Date.now() - createdAt.getTime()) / 60000);

  return (
    <Card className="text-sm">
      <CardContent className="space-y-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground">#{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">
              {order.deliveryMode === "DELIVERY" ? "Domicilio" : "Recogida"} · hace {timeAgo}m
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {order.total.toFixed(2)} €
          </span>
        </div>

        {/* Items */}
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-xs">
              <span className="text-foreground">
                {item.quantity}× {item.dishName}
                {item.selectedVariant && (
                  <span className="text-muted-foreground"> ({item.selectedVariant})</span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="rounded bg-yellow-50 px-2 py-1 text-xs text-yellow-800">
            Nota: {order.notes}
          </p>
        )}

        {order.deliveryAddress && (
          <p className="text-xs text-muted-foreground truncate">📍 {order.deliveryAddress}</p>
        )}

        {/* Actions según estado */}
        {order.status === "PENDING" && (
          <div className="space-y-2 pt-1">
            {!showReject ? (
              <div className="flex gap-2">
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    min={5}
                    max={120}
                    step={5}
                    className="w-16 rounded border border-border bg-background px-2 py-1 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
                <Button
                  size="sm"
                  className="flex-1 text-xs h-7"
                  onClick={() => acceptMutation.mutate({ orderId: order.id, estimatedMinutes })}
                  disabled={acceptMutation.isPending}
                >
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 text-destructive hover:text-destructive"
                  onClick={() => setShowReject(true)}
                >
                  Rechazar
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motivo del rechazo"
                  className="w-full rounded border border-border bg-background px-2 py-1 text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 text-xs h-7"
                    onClick={() => rejectMutation.mutate({ orderId: order.id, reason: rejectReason })}
                    disabled={rejectMutation.isPending || !rejectReason.trim()}
                  >
                    Confirmar rechazo
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={() => setShowReject(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {order.status === "ACCEPTED" && (
          <Button
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => advanceMutation.mutate({ orderId: order.id, action: "preparing" })}
            disabled={advanceMutation.isPending}
          >
            Empezar preparacion
          </Button>
        )}

        {order.status === "PREPARING" && (
          <Button
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => advanceMutation.mutate({ orderId: order.id, action: "ready" })}
            disabled={advanceMutation.isPending}
          >
            Marcar listo
          </Button>
        )}

        {order.status === "READY" && (
          <Button
            size="sm"
            className="w-full text-xs h-7"
            onClick={() => advanceMutation.mutate({ orderId: order.id, action: "delivered" })}
            disabled={advanceMutation.isPending}
          >
            Marcar entregado
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
