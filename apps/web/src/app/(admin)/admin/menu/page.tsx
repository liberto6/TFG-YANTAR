"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DishList } from "@/features/admin-menu/components/DishList";

export default function AdminMenuPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Carta</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus platos y categorias
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/menu/categories"
            className="inline-flex h-10 items-center rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground hover:bg-secondary"
          >
            Categorias
          </Link>
          <Link
            href="/admin/menu/new"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
          >
            + Nuevo plato
          </Link>
        </div>
      </div>

      <DishList />
    </div>
  );
}
