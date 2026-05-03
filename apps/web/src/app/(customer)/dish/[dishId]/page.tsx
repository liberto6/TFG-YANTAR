"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
    for (const group of dish.variantGroups) {
      if (group.required && !selectedVariantId) return false;
    }
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
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  if (isError || !dish) {
    return (
      <div className="py-12 text-center text-body-sm text-muted-foreground">
        No se pudo cargar el plato.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      {dish.imageUrl && (
        <div className="relative h-56 w-full overflow-hidden rounded-2xl">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 640px"
          />
        </div>
      )}

      <div>
        <h1 className="text-h1 text-foreground">{dish.name}</h1>
        {dish.description && (
          <p className="mt-1.5 text-body text-muted-foreground">{dish.description}</p>
        )}
        <p className="mt-3 text-h2 text-primary">{dish.basePrice.toFixed(2)} €</p>
      </div>

      {dish.variantGroups.map((group) => (
        <VariantSelector
          key={group.id}
          group={group}
          selectedId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />
      ))}

      {dish.modifierGroups.map((group) => (
        <ModifierSelector
          key={group.id}
          group={group}
          selectedIds={selectedModifierIds}
          onToggle={toggleModifier}
        />
      ))}

      <div className="space-y-1.5">
        <Label htmlFor="dish-notes">Notas (opcional)</Label>
        <Textarea
          id="dish-notes"
          rows={2}
          maxLength={200}
          showCount
          placeholder="Sin cebolla, punto de cocción..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex items-center gap-1.5" role="group" aria-label="Cantidad">
            <button
              type="button"
              aria-label="Reducir cantidad"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus size={16} />
            </button>
            <span className="w-7 text-center text-body font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus size={16} />
            </button>
          </div>

          <Button
            size="lg"
            className="flex-1"
            disabled={!canAddToCart()}
            onClick={handleAddToCart}
          >
            Añadir al pedido — {(unitPrice * quantity).toFixed(2)} €
          </Button>
        </div>
      </div>
    </div>
  );
}
