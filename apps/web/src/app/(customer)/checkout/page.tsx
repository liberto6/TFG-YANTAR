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
import { AddressZoneSelector } from "@/features/branch/components/AddressZoneSelector";
import type { DeliveryCheckResult } from "@/features/branch/hooks/use-check-delivery";
import { api } from "@/lib/api-client";
import type { Order } from "@/features/orders/types/order.types";
import { RedeemAtCheckout } from "@/features/loyalty/components/RedeemAtCheckout";
import type { LoyaltyReward } from "@/features/loyalty/hooks/use-loyalty";
import { TimeSlotSelector } from "@/features/checkout/components/TimeSlotSelector";

type PaymentMethod = "CASH" | "CARD";
type DeliveryMode = "PICKUP" | "DELIVERY";

interface ConfirmedDelivery {
  address: string;
  fee: number;
  zoneId?: string;
  minOrderAmount: number;
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { branch: selectedBranch, selectBranch } = useBranch();
  const router = useRouter();

  const branchId = selectedBranch?.id;

  // Modos disponibles. Si la sucursal no expone serviceModes (legacy
  // localStorage), nos limitamos al modo con el que llegó.
  const availableModes: DeliveryMode[] =
    selectedBranch?.serviceModes && selectedBranch.serviceModes.length > 0
      ? selectedBranch.serviceModes
      : selectedBranch?.deliveryMode
        ? [selectedBranch.deliveryMode]
        : [];

  const [mode, setMode] = useState<DeliveryMode>(
    selectedBranch?.deliveryMode ?? "PICKUP",
  );
  const [delivery, setDelivery] = useState<ConfirmedDelivery | null>(
    selectedBranch?.deliveryMode === "DELIVERY" && selectedBranch.customerAddress
      ? {
          address: selectedBranch.customerAddress,
          fee: selectedBranch.deliveryFee ?? 0,
          zoneId: selectedBranch.deliveryZoneId,
          minOrderAmount: selectedBranch.minOrderAmount ?? 0,
        }
      : null,
  );
  const [isEditingAddress, setIsEditingAddress] = useState(
    mode === "DELIVERY" && !selectedBranch?.customerAddress,
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderId: string } | null>(null);

  const deliveryFee = mode === "DELIVERY" ? (delivery?.fee ?? 0) : 0;
  const minOrderAmount =
    mode === "DELIVERY" ? (delivery?.minOrderAmount ?? 0) : 0;
  const minOrderShortfall = Math.max(0, minOrderAmount - subtotal);
  const isBelowMinimum =
    mode === "DELIVERY" && delivery !== null && minOrderShortfall > 0;

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

  if (!branchId || !selectedBranch) {
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

  const requiresAddress = mode === "DELIVERY";
  const hasConfirmedAddress = delivery !== null && !isEditingAddress;
  const canConfirm =
    !isLoading &&
    (!requiresAddress || hasConfirmedAddress) &&
    !isBelowMinimum;

  function handleModeChange(next: DeliveryMode) {
    if (next === mode || !selectedBranch) return;
    setMode(next);
    setError(null);

    if (next === "PICKUP") {
      setIsEditingAddress(false);
      selectBranch({
        ...selectedBranch,
        deliveryMode: "PICKUP",
        deliveryFee: 0,
      });
    } else {
      // DELIVERY: si tenemos una zona ya confirmada de antes la reutilizamos;
      // si no, abrimos el editor de dirección.
      if (delivery) {
        setIsEditingAddress(false);
        selectBranch({
          ...selectedBranch,
          deliveryMode: "DELIVERY",
          deliveryFee: delivery.fee,
          customerAddress: delivery.address,
          deliveryZoneId: delivery.zoneId,
          minOrderAmount: delivery.minOrderAmount,
        });
      } else {
        setIsEditingAddress(true);
      }
    }
  }

  function handleAddressConfirmed(
    result: DeliveryCheckResult,
    address: string,
  ) {
    if (!selectedBranch) return;
    const next: ConfirmedDelivery = {
      address,
      fee: result.deliveryFee,
      zoneId: result.zoneId,
      minOrderAmount: result.minOrderAmount,
    };
    setDelivery(next);
    setIsEditingAddress(false);
    selectBranch({
      ...selectedBranch,
      deliveryMode: "DELIVERY",
      deliveryFee: next.fee,
      customerAddress: next.address,
      deliveryZoneId: next.zoneId,
      minOrderAmount: next.minOrderAmount,
    });
  }

  async function handleConfirm() {
    if (!canConfirm) return;
    setError(null);
    setIsLoading(true);
    try {
      const order = await api.post<Order>("/orders", {
        branchId,
        deliveryMode: mode,
        deliveryAddress: mode === "DELIVERY" ? delivery?.address : undefined,
        deliveryFee: mode === "DELIVERY" ? (delivery?.fee ?? 0) : 0,
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

  const showModeSelector = availableModes.length > 1;

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-h1 text-foreground">Confirmar pedido</h1>

      <Card>
        <CardContent className="flex items-start justify-between gap-3 pt-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag size={18} />
            </span>
            <div className="space-y-0.5">
              <p className="text-body font-medium text-foreground">
                {selectedBranch.name}
              </p>
              <p className="text-body-sm text-muted-foreground">
                {selectedBranch.address}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-caption text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Cambiar local"
          >
            <Pencil size={12} /> Cambiar local
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-h3 text-foreground">Modo de entrega</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {showModeSelector ? (
            <RadioGroup
              name="delivery-mode"
              value={mode}
              onValueChange={(v) => handleModeChange(v as DeliveryMode)}
              className="grid gap-2 sm:grid-cols-2"
            >
              {availableModes.includes("PICKUP") && (
                <RadioGroupItem
                  value="PICKUP"
                  label={
                    <span className="flex items-center gap-2">
                      <ShoppingBag size={16} className="text-primary" />
                      Recoger en local
                    </span>
                  }
                  description="Sin gastos de envío"
                />
              )}
              {availableModes.includes("DELIVERY") && (
                <RadioGroupItem
                  value="DELIVERY"
                  label={
                    <span className="flex items-center gap-2">
                      <Bike size={16} className="text-accent" />
                      Envío a domicilio
                    </span>
                  }
                  description="Te lo llevamos"
                />
              )}
            </RadioGroup>
          ) : (
            <p className="text-body-sm text-muted-foreground">
              {mode === "PICKUP"
                ? "Recoges tu pedido en el local."
                : "Te lo llevamos a tu dirección."}
            </p>
          )}

          {mode === "DELIVERY" && (
            <div className="space-y-3 border-t border-border pt-3">
              {hasConfirmedAddress && delivery ? (
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-body-sm font-medium text-foreground">
                        {delivery.address}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        Envío {delivery.fee.toFixed(2)} €
                        {delivery.minOrderAmount > 0 && (
                          <>
                            {" · "}Pedido mínimo {delivery.minOrderAmount.toFixed(2)} €
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingAddress(true)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-caption text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="Cambiar dirección"
                    >
                      <Pencil size={12} /> Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <AddressZoneSelector
                  branchId={branchId}
                  initialAddress={delivery?.address ?? selectedBranch.customerAddress ?? ""}
                  onConfirmed={handleAddressConfirmed}
                  label="Dirección de envío"
                  inputId="checkout-address-input"
                  confirmLabel="Verificar zona"
                  outOfZoneFallback={
                    availableModes.includes("PICKUP") ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModeChange("PICKUP")}
                      >
                        Cambiar a recogida en local
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
            {mode === "DELIVERY" && hasConfirmedAddress && (
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

      {isBelowMinimum && (
        <Alert variant="warning" heading="Subtotal insuficiente">
          El pedido mínimo de tu zona es {minOrderAmount.toFixed(2)} €. Te
          faltan {minOrderShortfall.toFixed(2)} € para poder confirmar.
        </Alert>
      )}

      {requiresAddress && !hasConfirmedAddress && !isEditingAddress && (
        <Alert variant="warning">
          Confirma una dirección de envío para continuar.
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        className="w-full"
        size="lg"
        loading={isLoading}
        disabled={!canConfirm}
        onClick={handleConfirm}
      >
        {isLoading
          ? "Enviando pedido…"
          : `Confirmar pedido — ${total.toFixed(2)} €`}
      </Button>
    </div>
  );
}
