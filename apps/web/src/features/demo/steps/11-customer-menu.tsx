"use client";

import { useState } from "react";
import { Filter, ShoppingCart } from "lucide-react";
import { CategoryNav } from "@/features/menu/components/CategoryNav";
import { DishCard } from "@/features/menu/components/DishCard";
import { DemoChapter } from "../components/DemoChapter";
import {
  DEMO_COMPANY,
  NAPOLI_CATEGORIES,
  NAPOLI_DISHES,
} from "../data/napoli-fixtures";

/**
 * Paso 11 — Carlos navega la carta. Usa los componentes reales `<CategoryNav>`
 * y `<DishCard>` de la app (con sus mismos estilos) montados con datos
 * mockeados. La cabecera con branding se sigue simulando porque la app real
 * la inyecta vía CSS vars desde el CustomerLayout.
 */
export function Step11CustomerMenu() {
  const [activeCat, setActiveCat] = useState<string | null>(
    NAPOLI_CATEGORIES[0]?.id ?? null,
  );

  return (
    <DemoChapter url="napoli.yantar.app/menu" device="mobile">
      <div className="min-h-[520px] bg-background">
        <header
          className="flex items-center justify-between px-4 py-3 text-white"
          style={{ background: DEMO_COMPANY.colorPrimary }}
        >
          <span className="text-body-sm font-semibold">{DEMO_COMPANY.appName}</span>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white">
            <ShoppingCart size={14} />
          </span>
        </header>

        <div className="flex items-center gap-2 border-b border-border bg-surface/50 px-4 py-2">
          <button className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-caption text-muted-foreground">
            <Filter size={11} /> Alérgenos
          </button>
          <span className="text-caption text-muted-foreground">·</span>
          <span className="text-caption text-muted-foreground">
            {NAPOLI_DISHES.length} platos
          </span>
        </div>

        <CategoryNav
          categories={NAPOLI_CATEGORIES}
          activeId={activeCat}
          onSelect={setActiveCat}
        />

        <div className="space-y-3 p-4">
          <h2 className="text-h3 text-foreground">Pizzas</h2>
          {NAPOLI_DISHES.map((d, i) => (
            <div
              key={d.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <DishCard dish={d} />
            </div>
          ))}
        </div>
      </div>
    </DemoChapter>
  );
}
