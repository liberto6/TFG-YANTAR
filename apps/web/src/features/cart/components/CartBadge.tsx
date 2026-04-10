"use client";

import { useCart } from "../hooks/use-cart";

export function CartBadge() {
  const { totalItems, openDrawer } = useCart();

  return (
    <button
      onClick={openDrawer}
      className="relative rounded-md px-3 py-1.5 transition-colors hover:bg-white/10"
      aria-label={`Ver pedido (${totalItems} items)`}
    >
      Pedido
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  );
}
