"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Dish } from "../types/menu.types";

interface DishCardProps {
  dish: Dish;
}

export function DishCard({ dish }: DishCardProps) {
  const hasCustomization =
    dish.variantGroups.length > 0 || dish.modifierGroups.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/dish/${dish.id}`} className="flex gap-3 p-3">
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
                <Button size="sm">Anadir</Button>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
