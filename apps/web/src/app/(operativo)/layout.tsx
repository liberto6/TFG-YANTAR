"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export default function OperativoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Minimal header - optimized for tablet usage */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
        <Link href="/orders" className="text-base font-bold text-primary">
          Yantar Operativo
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Conectado
          </span>
          <button className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-secondary">
            Cerrar sesion
          </button>
        </div>
      </header>

      {/* Full-width content area for order boards */}
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
