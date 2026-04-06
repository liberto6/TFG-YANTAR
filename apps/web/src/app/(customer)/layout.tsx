"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Restaurant branding header - colors driven by CSS custom properties */}
      <header className="sticky top-0 z-50 border-b border-border bg-primary text-white">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Restaurante
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/menu"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-white/10"
            >
              Carta
            </Link>
            <Link
              href="/menu"
              className="relative rounded-md px-3 py-1.5 transition-colors hover:bg-white/10"
            >
              Pedido
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold">
                0
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content area - mobile first, max-width constrained */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Powered by Yantar
      </footer>
    </div>
  );
}
