"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDishSheet } from "./DishSheetProvider";
import type { Dish } from "../types/menu.types";

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  const sheet = useDishSheet();
  const hasCustomization =
    dish.variantGroups.length > 0 || dish.modifierGroups.length > 0;

  const inner = (
    <>
      {dish.imageUrl && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="font-medium text-foreground leading-tight">
            {dish.name}
          </h3>
          {dish.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {dish.description}
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">
            {dish.basePrice.toFixed(2)} €
          </span>
          {hasCustomization ? (
            <Button size="sm" variant="outline">
              Personalizar
            </Button>
          ) : (
            <Button size="sm">Añadir</Button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <Card className="overflow-hidden hover-lift">
      <CardContent className="p-0">
        <CardActivator
          dishId={dish.id}
          openSheet={sheet?.openDish}
          className="flex gap-3 p-3"
        >
          {inner}
        </CardActivator>
      </CardContent>
    </Card>
  );
}

/**
 * Si hay DishSheetProvider arriba, abre el bottom sheet (sin navegar).
 * Si no, navega a la URL directa `/dish/[id]` como fallback.
 */
function CardActivator({
  dishId,
  openSheet,
  className,
  children,
}: {
  dishId: string;
  openSheet: ((id: string) => void) | undefined;
  className?: string;
  children: ReactNode;
}) {
  if (openSheet) {
    return (
      <button
        type="button"
        onClick={() => openSheet(dishId)}
        className={`${className} w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
      >
        {children}
      </button>
    );
  }
  return (
    <Link href={`/dish/${dishId}`} className={className}>
      {children}
    </Link>
  );
}
