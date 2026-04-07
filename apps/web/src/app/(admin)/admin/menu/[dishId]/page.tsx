"use client";

import { useParams } from "next/navigation";
import { useDishDetail } from "@/features/menu/hooks/use-dish-detail";
import { DishForm } from "@/features/admin-menu/components/DishForm";

export default function EditDishPage() {
  const { dishId } = useParams<{ dishId: string }>();
  const { data: dish, isLoading } = useDishDetail(dishId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!dish) {
    return <p className="text-muted-foreground">Plato no encontrado.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Editar plato</h2>
        <p className="text-sm text-muted-foreground">{dish.name}</p>
      </div>
      <DishForm dish={dish} />
    </div>
  );
}
