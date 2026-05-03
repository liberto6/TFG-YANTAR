"use client";

import { useState } from "react";
import {
  Bike,
  Clock,
  MapPin,
  ShoppingBag,
  StickyNote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import type { Order } from "@/features/orders/types/order.types";
import {
  useAcceptOrder,
  useRejectOrder,
  useAdvanceOrderStatus,
} from "../hooks/use-active-orders";

interface OrderKanbanCardProps {
  order: Order;
}

function timeAgoBucket(minutes: number): { label: string; classes: string } {
  if (minutes < 5) return { label: `hace ${minutes}m`, classes: "bg-success/10 text-success" };
  if (minutes < 15) return { label: `hace ${minutes}m`, classes: "bg-warning/10 text-warning" };
  return { label: `hace ${minutes}m`, classes: "bg-danger/10 text-danger" };
}

export function OrderKanbanCard({ order }: OrderKanbanCardProps) {
  const acceptMutation = useAcceptOrder();
  const rejectMutation = useRejectOrder();
  const advanceMutation = useAdvanceOrderStatus();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(20);

  const createdAt = new Date(order.createdAt);
  const minutesAgo = Math.max(0, Math.round((Date.now() - createdAt.getTime()) / 60000));
  const timeBadge = timeAgoBucket(minutesAgo);
  const ModeIcon = order.deliveryMode === "DELIVERY" ? Bike : ShoppingBag;

  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-body font-semibold text-foreground tabular-nums">
              #{order.id.slice(-6).toUpperCase()}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ModeIcon size={11} />
                {order.deliveryMode === "DELIVERY" ? "Domicilio" : "Recogida"}
              </span>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium", timeBadge.classes)}>
                <Clock size={11} /> {timeBadge.label}
              </span>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-body-sm font-semibold tabular-nums text-foreground">
            {order.total.toFixed(2)} €
          </span>
        </div>

        <ul className="space-y-1 border-y border-border py-2">
          {order.items.map((item) => (
            <li key={item.id} className="text-caption">
              <span className="font-medium text-foreground tabular-nums">
                {item.quantity}×
              </span>{" "}
              <span className="text-foreground">{item.dishName}</span>
              {item.selectedVariant && (
                <span className="text-muted-foreground"> · {item.selectedVariant}</span>
              )}
              {item.selectedModifiers.length > 0 && (
                <p className="ml-4 text-muted-foreground">
                  + {item.selectedModifiers.map((m) => m.name).join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>

        {order.scheduledTime && (
          <div className="flex items-center gap-1.5 rounded-md bg-info/10 px-2 py-1 text-caption font-medium text-info">
            <Clock size={12} />
            Para las{" "}
            {new Date(order.scheduledTime).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        {order.notes && (
          <div className="flex items-start gap-1.5 rounded-md bg-warning/10 px-2 py-1 text-caption text-foreground">
            <StickyNote size={12} className="mt-0.5 shrink-0 text-warning" />
            <span>{order.notes}</span>
          </div>
        )}

        {order.deliveryAddress && (
          <p className="inline-flex items-start gap-1 text-caption text-muted-foreground">
            <MapPin size={11} className="mt-0.5 shrink-0" />
            <span className="truncate">{order.deliveryAddress}</span>
          </p>
        )}

        {order.status === "PENDING" && !showReject && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                min={5}
                max={120}
                step={5}
                className="h-9 w-16"
                aria-label="Minutos estimados de preparación"
              />
              <span className="text-caption text-muted-foreground">min</span>
              <Button
                size="sm"
                className="ml-auto"
                loading={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate({ orderId: order.id, estimatedMinutes })}
              >
                Aceptar
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-muted-foreground hover:bg-danger/10 hover:text-danger"
              onClick={() => setShowReject(true)}
            >
              Rechazar
            </Button>
          </div>
        )}

        {order.status === "PENDING" && showReject && (
          <div className="space-y-2 pt-1">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo (visible para el cliente)"
              rows={2}
              maxLength={140}
              showCount
              aria-label="Motivo del rechazo"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                loading={rejectMutation.isPending}
                disabled={!rejectReason.trim()}
                onClick={() => rejectMutation.mutate({ orderId: order.id, reason: rejectReason })}
              >
                Confirmar rechazo
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<X size={14} />}
                onClick={() => {
                  setShowReject(false);
                  setRejectReason("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {order.status === "ACCEPTED" && (
          <Button
            size="sm"
            className="w-full"
            loading={advanceMutation.isPending}
            onClick={() => advanceMutation.mutate({ orderId: order.id, action: "preparing" })}
          >
            Empezar preparación
          </Button>
        )}

        {order.status === "PREPARING" && (
          <Button
            size="sm"
            className="w-full"
            loading={advanceMutation.isPending}
            onClick={() => advanceMutation.mutate({ orderId: order.id, action: "ready" })}
          >
            Marcar listo
          </Button>
        )}

        {order.status === "READY" && (
          <Button
            size="sm"
            className="w-full"
            loading={advanceMutation.isPending}
            onClick={() => advanceMutation.mutate({ orderId: order.id, action: "delivered" })}
          >
            Marcar entregado
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
