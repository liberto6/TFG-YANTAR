"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/hooks/use-cart";
import { cn } from "@/lib/cn";

const HIDDEN_PATHS = ["/checkout"];

/**
 * Barra flotante inferior con resumen del carrito y CTA. Visible siempre que
 * el carrito tenga items y la ruta no sea /checkout (que ya muestra resumen
 * propio). Se anima con bounce al añadir un nuevo item — patrón Wolt/Glovo.
 */
export function CartFloatingBar() {
  const { items, totalItems, subtotal, openDrawer } = useCart();
  const pathname = usePathname();
  const [bump, setBump] = useState(false);
  const lastCount = useRef(totalItems);

  // Bump animation cuando crece el contador (item añadido).
  useEffect(() => {
    if (totalItems > lastCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 360);
      return () => clearTimeout(t);
    }
    lastCount.current = totalItems;
  }, [totalItems]);

  const isHidden =
    items.length === 0 ||
    HIDDEN_PATHS.some((p) => pathname.startsWith(p));

  if (isHidden) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:pb-4 animate-fade-in-up"
      // safe-area iOS
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
    >
      <button
        onClick={openDrawer}
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-primary-glow-lg transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 active:translate-y-0",
          bump && "animate-bump",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <ShoppingCart size={16} />
            <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-background px-1 text-[10px] font-semibold text-foreground tabular-nums">
              {totalItems}
            </span>
          </span>
          <span className="text-body-sm font-medium">
            {totalItems === 1 ? "1 plato" : `${totalItems} platos`} en el carrito
          </span>
        </div>
        <span className="font-mono text-body font-semibold tabular-nums">
          {subtotal.toFixed(2)} €
        </span>
      </button>
    </div>
  );
}
