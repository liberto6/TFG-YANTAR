"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDishDetail } from "@/features/menu/hooks/use-dish-detail";
import { VariantSelector } from "@/features/menu/components/VariantSelector";
import { ModifierSelector } from "@/features/menu/components/ModifierSelector";
import { useCart } from "@/features/cart/hooks/use-cart";

export default function DishDetailPage() {
  const { dishId } = useParams<{ dishId: string }>();
  const router = useRouter();
  const { data: dish, isLoading, isError } = useDishDetail(dishId);
  const { addItem, openDrawer } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedModifierIds, setSelectedModifierIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Calculate price
  const unitPrice = useMemo(() => {
    if (!dish) return 0;
    let price = dish.basePrice;

    if (selectedVariantId) {
      const variant = dish.variantGroups
        .flatMap((g) => g.options)
        .find((o) => o.id === selectedVariantId);
      if (variant) price += variant.priceAdjustment;
    }

    for (const modId of selectedModifierIds) {
      const mod = dish.modifierGroups
        .flatMap((g) => g.options)
        .find((o) => o.id === modId);
      if (mod) price += mod.extraPrice;
    }

    return Math.round(price * 100) / 100;
  }, [dish, selectedVariantId, selectedModifierIds]);

  function toggleModifier(optionId: string) {
    setSelectedModifierIds((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  }

  function canAddToCart(): boolean {
    if (!dish) return false;
    // Check all required variant groups have a selection
    for (const group of dish.variantGroups) {
      if (group.required && !selectedVariantId) return false;
    }
    // Check required modifier groups
    for (const group of dish.modifierGroups) {
      if (group.required) {
        const selected = group.options.filter((o) =>
          selectedModifierIds.has(o.id),
        ).length;
        if (selected < group.minSelections) return false;
      }
    }
    return true;
  }

  function handleAddToCart() {
    if (!dish || !canAddToCart()) return;

    const selectedVariantName = selectedVariantId
      ? dish.variantGroups
          .flatMap((g) => g.options)
          .find((o) => o.id === selectedVariantId)?.name ?? null
      : null;

    const selectedModifiers = [...selectedModifierIds].map((id) => {
      const opt = dish.modifierGroups
        .flatMap((g) => g.options)
        .find((o) => o.id === id)!;
      return { id, name: opt.name, price: opt.extraPrice };
    });

    addItem({
      dishId: dish.id,
      dishName: dish.name,
      basePrice: dish.basePrice,
      unitPrice,
      quantity,
      selectedVariantOptionId: selectedVariantId,
      selectedVariantName,
      selectedModifierOptionIds: [...selectedModifierIds],
      selectedModifiers,
      notes: notes.trim() || null,
      imageUrl: dish.imageUrl,
    });

    openDrawer();
    router.back();
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (isError || !dish) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No se pudo cargar el plato.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Image */}
      {dish.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-xl">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
        </div>
      )}

      {/* Title & description */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{dish.name}</h1>
        {dish.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {dish.description}
          </p>
        )}
        <p className="mt-2 text-lg font-semibold text-primary">
          {dish.basePrice.toFixed(2)} €
        </p>
      </div>

      {/* Variants */}
      {dish.variantGroups.map((group) => (
        <VariantSelector
          key={group.id}
          group={group}
          selectedId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />
      ))}

      {/* Modifiers */}
      {dish.modifierGroups.map((group) => (
        <ModifierSelector
          key={group.id}
          group={group}
          selectedIds={selectedModifierIds}
          onToggle={toggleModifier}
        />
      ))}

      {/* Notes */}
      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="text-sm font-medium text-foreground"
        >
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          rows={2}
          placeholder="Sin cebolla, punto de coccion..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </Button>
            <span className="w-6 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </Button>
          </div>

          <Button
            className="flex-1"
            disabled={!canAddToCart()}
            onClick={handleAddToCart}
          >
            Anadir al pedido — {(unitPrice * quantity).toFixed(2)} €
          </Button>
        </div>
      </div>
    </div>
  );
}
