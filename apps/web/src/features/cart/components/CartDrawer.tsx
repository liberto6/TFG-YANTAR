"use client";

import Link from "next/link";
import { useCart } from "../hooks/use-cart";
import { CartItem } from "./CartItem";

export function CartDrawer() {
  const { items, isOpen, closeDrawer, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold text-foreground">
            Tu pedido ({totalItems})
          </h2>
          <button
            onClick={closeDrawer}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 divide-y divide-border">
          {items.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground text-sm">
              Tu carrito esta vacio
            </p>
          ) : (
            items.map((item) => <CartItem key={item.cartItemId} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-4 py-4 space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Ir al checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
