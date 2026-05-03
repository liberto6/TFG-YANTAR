"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Bike, CreditCard, Pencil, ShoppingBag } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SuccessCheckmark } from "@/components/ui/success-checkmark";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/features/cart/hooks/use-cart";
import { useBranch } from "@/features/branch/context/branch-context";
import { api } from "@/lib/api-client";
import type { Order } from "@/features/orders/types/order.types";
import { RedeemAtCheckout } from "@/features/loyalty/components/RedeemAtCheckout";
import type { LoyaltyReward } from "@/features/loyalty/hooks/use-loyalty";
import { TimeSlotSelector } from "@/features/checkout/components/TimeSlotSelector";

type PaymentMethod = "CASH" | "CARD";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { branch: selectedBranch } = useBranch();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string } | null>(null);

  const branchId = selectedBranch?.id;
  const deliveryMode = selectedBranch?.deliveryMode ?? "PICKUP";
  const deliveryAddress =
    deliveryMode === "DELIVERY" ? (selectedBranch?.customerAddress ?? "") : "";
  const deliveryFee = deliveryMode === "DELIVERY" ? (selectedBranch?.deliveryFee ?? 0) : 0;

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
        <p className="text-body-sm text-muted-foreground">Tu carrito está vacío.</p>
        <Button onClick={() => router.push("/menu")} variant="outline">
          Ver carta
        </Button>
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-body-sm text-muted-foreground">
          Aún no has elegido un local. Vuelve al inicio para seleccionarlo.
        </p>
        <Button onClick={() => router.push("/")} variant="outline">
          Elegir local
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
      setSuccess({ orderId: order.id });
      // Mantener el overlay 1.4s antes de redirigir
      setTimeout(() => router.push(`/orders/${order.id}`), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el pedido");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center animate-fade-in">
        <SuccessCheckmark size={88} />
        <div className="space-y-1">
          <p className="text-h2 text-foreground">¡Pedido confirmado!</p>
          <p className="text-body-sm text-muted-foreground">
            Te llevamos al seguimiento en tiempo real…
          </p>
        </div>
      </div>
    );
  }

  const ModeIcon = deliveryMode === "PICKUP" ? ShoppingBag : Bike;

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-h1 text-foreground">Confirmar pedido</h1>

      {selectedBranch && (
        <Card>
          <CardContent className="flex items-start justify-between gap-3 pt-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ModeIcon size={18} />
              </span>
              <div className="space-y-0.5">
                <p className="text-body font-medium text-foreground">{selectedBranch.name}</p>
                <p className="text-body-sm text-muted-foreground">
                  {deliveryMode === "PICKUP" ? "Recogida en el local" : "Envío a domicilio"}
                </p>
                {deliveryMode === "DELIVERY" && deliveryAddress && (
                  <p className="text-caption text-muted-foreground">{deliveryAddress}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push("/")}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-caption text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Cambiar local o modo de entrega"
            >
              <Pencil size={12} /> Cambiar
            </button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-h3 text-foreground">¿Cuándo quieres tu pedido?</h2>
        </CardHeader>
        <CardContent>
          <TimeSlotSelector
            branchId={branchId}
            value={scheduledTime}
            onChange={setScheduledTime}
          />
          {scheduledTime && (
            <p className="mt-2 text-body-sm text-muted-foreground">
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

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-h3 text-foreground">Método de pago</h2>
        </CardHeader>
        <CardContent>
          <RadioGroup
            name="payment-method"
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            className="grid gap-2 sm:grid-cols-2"
          >
            <RadioGroupItem
              value="CASH"
              label={
                <span className="flex items-center gap-2">
                  <Banknote size={16} className="text-success" />
                  Efectivo
                </span>
              }
              description="Pagas al recibir"
            />
            <RadioGroupItem
              value="CARD"
              label={
                <span className="flex items-center gap-2">
                  <CreditCard size={16} className="text-info" />
                  Tarjeta
                </span>
              }
              description="Datáfono al entregar"
            />
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-h3 text-foreground">Notas del pedido</h2>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="checkout-notes" className="sr-only">
            Notas del pedido
          </Label>
          <Textarea
            id="checkout-notes"
            rows={2}
            maxLength={200}
            showCount
            placeholder="Instrucciones especiales (opcional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <RedeemAtCheckout
        selectedReward={selectedReward}
        onRewardSelected={setSelectedReward}
      />

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-h3 text-foreground">Resumen</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex justify-between text-body-sm">
              <span className="text-foreground">
                <span className="text-muted-foreground">{item.quantity}×</span> {item.dishName}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {(item.unitPrice * item.quantity).toFixed(2)} €
              </span>
            </div>
          ))}
          <div className="space-y-1 border-t border-border pt-2">
            <div className="flex justify-between text-body-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{subtotal.toFixed(2)} €</span>
            </div>
            {deliveryMode === "DELIVERY" && (
              <div className="flex justify-between text-body-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="tabular-nums">{deliveryFee.toFixed(2)} €</span>
              </div>
            )}
            {selectedReward && rewardDiscount > 0 && (
              <div className="flex justify-between text-body-sm text-success">
                <span>Descuento ({selectedReward.name})</span>
                <span className="tabular-nums">−{rewardDiscount.toFixed(2)} €</span>
              </div>
            )}
            {scheduledTime && (
              <div className="flex justify-between text-body-sm text-muted-foreground">
                <span>Hora programada</span>
                <span>
                  {new Date(scheduledTime).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-body font-semibold">
              <span>Total</span>
              <span className="text-primary tabular-nums">{total.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        className="w-full"
        size="lg"
        loading={isLoading}
        disabled={isLoading || (deliveryMode === "DELIVERY" && !deliveryAddress.trim())}
        onClick={handleConfirm}
      >
        {isLoading
          ? "Enviando pedido…"
          : `Confirmar pedido — ${total.toFixed(2)} €`}
      </Button>
    </div>
  );
}
