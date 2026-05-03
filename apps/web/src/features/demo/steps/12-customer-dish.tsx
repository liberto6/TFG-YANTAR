"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { VariantSelector } from "@/features/menu/components/VariantSelector";
import { ModifierSelector } from "@/features/menu/components/ModifierSelector";
import { DemoChapter } from "../components/DemoChapter";
import { DEMO_COMPANY, NAPOLI_PEPPERONI } from "../data/napoli-fixtures";

/**
 * Paso 12 — Carlos personaliza su pizza. Usa los componentes reales
 * `<VariantSelector>` y `<ModifierSelector>` con su lógica de selección.
 * La selección se anima en secuencia para mostrar el flujo completo.
 */
export function Step12CustomerDish() {
  const dish = NAPOLI_PEPPERONI;
  const variantGroup = dish.variantGroups[0]!;
  const modifierGroup = dish.modifierGroups[0]!;

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Set<string>>(new Set());

  // Auto-selección secuenciada para que la demo cuente la historia sola.
  useEffect(() => {
    const t1 = setTimeout(() => setSelectedVariantId("demo-var-m"), 1500);
    const t2 = setTimeout(
      () => setSelectedModifiers(new Set(["demo-mod-1"])),
      3500,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const variantPrice =
    variantGroup.options.find((o) => o.id === selectedVariantId)
      ?.priceAdjustment ?? 0;
  const modPrice = modifierGroup.options
    .filter((o) => selectedModifiers.has(o.id))
    .reduce((acc, m) => acc + m.extraPrice, 0);
  const total = dish.basePrice + variantPrice + modPrice;

  function toggleModifier(id: string) {
    setSelectedModifiers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <DemoChapter url="napoli.yantar.app/dish/pepperoni" device="mobile">
      <div className="relative min-h-[560px] bg-background pb-16">
        <div
          className="relative h-32"
          style={{
            background: `linear-gradient(135deg, ${DEMO_COMPANY.colorPrimary}, ${DEMO_COMPANY.colorAccent})`,
          }}
        >
          <button className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/85 text-foreground">
            <ArrowLeft size={14} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <div>
            <h1 className="text-h2 text-foreground">{dish.name}</h1>
            <p className="text-body-sm text-muted-foreground">{dish.description}</p>
          </div>

          <VariantSelector
            group={variantGroup}
            selectedId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />

          <ModifierSelector
            group={modifierGroup}
            selectedIds={selectedModifiers}
            onToggle={toggleModifier}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-border bg-background px-3 py-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-body-sm">
            <Minus size={12} />
            <span className="w-4 text-center font-medium">1</span>
            <Plus size={12} />
          </div>
          <button
            className="flex flex-1 items-center justify-between rounded-md px-4 py-2 text-body-sm font-medium text-primary-foreground transition-all"
            style={{ background: DEMO_COMPANY.colorPrimary }}
          >
            <span>Añadir al carrito</span>
            <span className="tabular-nums">{total.toFixed(2)} €</span>
          </button>
        </div>
      </div>
    </DemoChapter>
  );
}
