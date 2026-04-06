"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/features/cart/hooks/use-cart";
import { api } from "@/lib/api-client";
import type { Order } from "@/features/orders/types/order.types";

type DeliveryMode = "PICKUP" | "DELIVERY";
type PaymentMethod = "CASH" | "CARD";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchId = process.env.NEXT_PUBLIC_BRANCH_ID!;
  const deliveryFee = deliveryMode === "DELIVERY" ? 2.5 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
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
        notes: notes.trim() || undefined,
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
      setError(
        err instanceof Error ? err.message : "Error al crear el pedido",
      );
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
          <Button
            variant={deliveryMode === "PICKUP" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setDeliveryMode("PICKUP")}
          >
            Recogida
          </Button>
          <Button
            variant={deliveryMode === "DELIVERY" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setDeliveryMode("DELIVERY")}
          >
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

      {/* Payment method */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">Metodo de pago</h2>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            variant={paymentMethod === "CASH" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setPaymentMethod("CASH")}
          >
            Efectivo
          </Button>
          <Button
            variant={paymentMethod === "CARD" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setPaymentMethod("CARD")}
          >
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

      {/* Order summary */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium text-foreground">Resumen</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.quantity}x {item.dishName}
              </span>
              <span className="text-muted-foreground">
                {(item.unitPrice * item.quantity).toFixed(2)} €
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-2 space-y-1">
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
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{total.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={
          isLoading ||
          (deliveryMode === "DELIVERY" && !deliveryAddress.trim())
        }
        onClick={handleConfirm}
      >
        {isLoading ? "Enviando pedido..." : `Confirmar pedido — ${total.toFixed(2)} €`}
      </Button>
    </div>
  );
}
