"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "../hooks/use-cart";
import type { CartItem as CartItemType } from "../types/cart.types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{item.dishName}</p>
        {item.selectedVariantName && (
          <p className="text-xs text-muted-foreground">
            {item.selectedVariantName}
          </p>
        )}
        {item.selectedModifiers.length > 0 && (
          <p className="text-xs text-muted-foreground">
            + {item.selectedModifiers.map((m) => m.name).join(", ")}
          </p>
        )}
        {item.notes && (
          <p className="text-xs italic text-muted-foreground">
            Nota: {item.notes}
          </p>
        )}
        <p className="mt-1 text-sm font-semibold text-primary">
          {(item.unitPrice * item.quantity).toFixed(2)} €
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
        >
          −
        </Button>
        <span className="w-5 text-center text-sm">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
        >
          +
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => removeItem(item.cartItemId)}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
