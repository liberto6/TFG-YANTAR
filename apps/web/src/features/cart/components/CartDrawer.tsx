"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { EmptyCartIllustration } from "@/components/illustrations";
import { useCart } from "../hooks/use-cart";
import { CartItem } from "./CartItem";

export function CartDrawer() {
  const { items, isOpen, closeDrawer, subtotal, totalItems } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, closeDrawer]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in bg-black/40"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm animate-slide-in-right flex-col bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-h3">
            Tu pedido{totalItems > 0 && ` (${totalItems})`}
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center animate-fade-in-up">
              <div className="text-muted-foreground">
                <EmptyCartIllustration size={88} />
              </div>
              <div className="space-y-1">
                <p className="text-body font-medium text-foreground">
                  Tu carrito está esperando
                </p>
                <p className="text-body-sm text-muted-foreground">
                  Añade algún plato de la carta para empezar.
                </p>
              </div>
              <Link
                href="/menu"
                onClick={closeDrawer}
                className="text-body-sm font-medium text-primary hover:underline"
              >
                Ver la carta →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border px-4">
              {items.map((item) => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div
            className="space-y-3 border-t border-border bg-surface px-4 pt-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex justify-between text-body-sm font-medium">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-6 text-body font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Ir al checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
