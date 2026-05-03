"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../hooks/use-cart";
import type { CartItem as CartItemType } from "../types/cart.types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-foreground">{item.dishName}</p>
        {item.selectedVariantName && (
          <p className="text-caption text-muted-foreground">
            {item.selectedVariantName}
          </p>
        )}
        {item.selectedModifiers.length > 0 && (
          <p className="text-caption text-muted-foreground">
            + {item.selectedModifiers.map((m) => m.name).join(", ")}
          </p>
        )}
        {item.notes && (
          <p className="text-caption italic text-muted-foreground">
            Nota: {item.notes}
          </p>
        )}
        <p className="mt-1 text-body-sm font-semibold text-primary">
          {(item.unitPrice * item.quantity).toFixed(2)} €
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
          aria-label="Reducir cantidad"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center text-body-sm tabular-nums">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
          aria-label="Aumentar cantidad"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => removeItem(item.cartItemId)}
          aria-label="Eliminar producto"
          className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
