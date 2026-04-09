"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/features/cart/hooks/use-cart";
import { api } from "@/lib/api-client";
import type { Order } from "@/features/orders/types/order.types";
import { RedeemAtCheckout } from "@/features/loyalty/components/RedeemAtCheckout";
import type { LoyaltyReward } from "@/features/loyalty/hooks/use-loyalty";
import { TimeSlotSelector } from "@/features/checkout/components/TimeSlotSelector";

type DeliveryMode = "PICKUP" | "DELIVERY";
type PaymentMethod = "CASH" | "CARD";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchId = process.env.NEXT_PUBLIC_BRANCH_ID!;
  const deliveryFee = deliveryMode === "DELIVERY" ? 2.5 : 0;

  const rewardDiscount =
    selectedReward?.type === "DISCOUNT_FIXED"
      ? Number(selectedReward.value)
      : selectedReward?.type === "DISCOUNT_PERCENT"
        ? subtotal * (Number(selectedReward.value) / 100)
        : 0;

  const total = Math.max(0, subtotal + deliveryFee - rewardDiscount);

  if (items.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">Tu carrito esta vacio.</p>
        <Button onClick={() => router.push("/menu")} variant="outline">
          Ver carta
        </Button>
      </div>
    );
  }

  async function handleConfirm() {
    setError(null);
    setIsLoading(true);
    try {
      const order = await api.post<Order>("/orders", {
        branchId,
        deliveryMode,
        deliveryAddress: deliveryMode === "DELIVERY" ? deliveryAddress : undefined,
        deliveryFee: deliveryMode === "DELIVERY" ? deliveryFee : 0,
        paymentMethod,
        scheduledTime: scheduledTime ?? undefined,
        notes: notes.trim() || undefined,
        rewardId: selectedReward?.id ?? undefined,
        items: items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          selectedVariantOptionId: item.selectedVariantOptionId ?? undefined,
          selectedModifierOptionIds: item.selectedModifierOptionIds,
          notes: item.notes ?? undefined,
        })),
      });
      clear();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el pedido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-bold text-foreground">Confirmar pedido</h1>

      {/* Delivery mode */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">Modalidad</h2>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant={deliveryMode === "PICKUP" ? "default" : "outline"} className="flex-1" onClick={() => setDeliveryMode("PICKUP")}>
            Recogida
          </Button>
          <Button variant={deliveryMode === "DELIVERY" ? "default" : "outline"} className="flex-1" onClick={() => setDeliveryMode("DELIVERY")}>
            Envio a casa
          </Button>
        </CardContent>
      </Card>

      {/* Delivery address */}
      {deliveryMode === "DELIVERY" && (
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-medium text-foreground">Direccion de entrega</h2>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Calle, numero, piso..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </CardContent>
        </Card>
      )}

      {/* Time slot */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">¿Cuándo quieres tu pedido?</h2>
        </CardHeader>
        <CardContent>
          <TimeSlotSelector
            branchId={branchId}
            value={scheduledTime}
            onChange={setScheduledTime}
          />
          {scheduledTime && (
            <p className="mt-2 text-sm text-muted-foreground">
              Hora programada:{" "}
              <span className="font-medium text-foreground">
                {new Date(scheduledTime).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">Metodo de pago</h2>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant={paymentMethod === "CASH" ? "default" : "outline"} className="flex-1" onClick={() => setPaymentMethod("CASH")}>
            Efectivo
          </Button>
          <Button variant={paymentMethod === "CARD" ? "default" : "outline"} className="flex-1" onClick={() => setPaymentMethod("CARD")}>
            Tarjeta
          </Button>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">Notas del pedido (opcional)</h2>
        </CardHeader>
        <CardContent>
          <textarea
            rows={2}
            placeholder="Instrucciones especiales..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </CardContent>
      </Card>

      {/* Loyalty redeem */}
      <RedeemAtCheckout
        selectedReward={selectedReward}
        onRewardSelected={setSelectedReward}
      />

      {/* Order summary */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">Resumen</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex justify-between text-sm">
              <span className="text-foreground">{item.quantity}x {item.dishName}</span>
              <span className="text-muted-foreground">{(item.unitPrice * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="space-y-1 border-t border-border pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            {deliveryMode === "DELIVERY" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envio</span>
                <span>{deliveryFee.toFixed(2)} €</span>
              </div>
            )}
            {selectedReward && rewardDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento ({selectedReward.name})</span>
                <span>−{rewardDiscount.toFixed(2)} €</span>
              </div>
            )}
            {scheduledTime && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Hora programada</span>
                <span>
                  {new Date(scheduledTime).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{total.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={isLoading || (deliveryMode === "DELIVERY" && !deliveryAddress.trim())}
        onClick={handleConfirm}
      >
        {isLoading ? "Enviando pedido..." : `Confirmar pedido — ${total.toFixed(2)} €`}
      </Button>
    </div>
  );
}
