"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminDishes, useToggleAvailability, useDeleteDish } from "../hooks/use-admin-dishes";
import type { Dish } from "@/features/menu/types/menu.types";

export function DishList() {
  const { data: dishes, isLoading } = useAdminDishes();
  const toggleMutation = useToggleAvailability();
  const deleteMutation = useDeleteDish();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!dishes || dishes.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No hay platos. Crea el primero.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dishes.map((dish: Dish) => (
        <Card key={dish.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{dish.name}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    dish.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {dish.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {dish.basePrice.toFixed(2)} €
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleMutation.mutate(dish.id)}
                disabled={toggleMutation.isPending}
              >
                {dish.status === "ACTIVE" ? "Desactivar" : "Activar"}
              </Button>
              <Link
                href={`/admin/menu/${dish.id}`}
                className="inline-flex h-8 items-center rounded-md border border-border bg-transparent px-3 text-xs font-medium text-foreground hover:bg-secondary"
              >
                Editar
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm(`¿Eliminar "${dish.name}"?`)) {
                    deleteMutation.mutate(dish.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
