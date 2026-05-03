"use client";

import Link from "next/link";
import { FolderOpen, Plus } from "lucide-react";
import { DishList } from "@/features/admin-menu/components/DishList";

export default function AdminMenuPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Carta</h2>
          <p className="text-body-sm text-muted-foreground">
            Gestiona tus platos y categorías
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/menu/categories"
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-transparent px-4 text-body-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <FolderOpen size={16} /> Categorías
          </Link>
          <Link
            href="/admin/menu/new"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus size={16} /> Nuevo plato
          </Link>
        </div>
      </div>

      <DishList />
    </div>
  );
}
