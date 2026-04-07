"use client";

import { DishForm } from "@/features/admin-menu/components/DishForm";

export default function NewDishPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Nuevo plato</h2>
        <p className="text-sm text-muted-foreground">
          Rellena los datos del plato
        </p>
      </div>
      <DishForm />
    </div>
  );
}
