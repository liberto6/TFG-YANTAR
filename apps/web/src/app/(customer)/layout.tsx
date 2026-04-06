"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CartBadge } from "@/features/cart/components/CartBadge";
import { CartDrawer } from "@/features/cart/components/CartDrawer";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Restaurant branding header */}
      <header className="sticky top-0 z-50 border-b border-border bg-primary text-white">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/menu" className="text-lg font-bold tracking-tight">
            {process.env.NEXT_PUBLIC_COMPANY_SLUG ?? "Restaurante"}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/menu"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10"
            >
              Carta
            </Link>
            <CartBadge />
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {children}
      </main>

      {/* Cart drawer */}
      <CartDrawer />

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Powered by Yantar
      </footer>
    </div>
  );
}
