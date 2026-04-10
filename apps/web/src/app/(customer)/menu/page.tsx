"use client";

import { useState, useEffect, useRef } from "react";
import { useMenu } from "@/features/menu/hooks/use-menu";
import { useAllergenFilter } from "@/features/menu/hooks/use-allergen-filter";
import { CategoryNav } from "@/features/menu/components/CategoryNav";
import { DishCard } from "@/features/menu/components/DishCard";
import { AllergenFilter } from "@/features/menu/components/AllergenFilter";

export default function MenuPage() {
  const { excluded, excludedList, toggle, clear, allergens } =
    useAllergenFilter();
  const { data, isLoading, isError } = useMenu(excludedList);

  const categories = data?.categories ?? [];
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showAllergens, setShowAllergens] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  function scrollToCategory(id: string) {
    setActiveCategoryId(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No se pudo cargar la carta. Intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category quick-nav */}
      <CategoryNav
        categories={categories}
        activeId={activeCategoryId}
        onSelect={scrollToCategory}
      />

      {/* Allergen filter toggle */}
      <div>
        <button
          onClick={() => setShowAllergens((v) => !v)}
          className="flex items-center gap-1 text-sm text-muted-foreground underline"
        >
          {showAllergens ? "Ocultar" : "Filtrar"} alergenos
          {excluded.size > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
              {excluded.size}
            </span>
          )}
        </button>
        {showAllergens && (
          <div className="mt-2">
            <AllergenFilter
              allergens={allergens}
              excluded={excluded}
              onToggle={toggle}
              onClear={clear}
            />
          </div>
        )}
      </div>

      {/* Menu sections */}
      {categories.map((category) => (
        <section
          key={category.id}
          ref={(el) => {
            sectionRefs.current[category.id] = el;
          }}
          className="space-y-3"
        >
          <h2 className="text-lg font-semibold text-foreground">
            {category.name}
          </h2>

          {category.dishes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay platos disponibles en esta categoria
              {excluded.size > 0 ? " con los filtros aplicados" : ""}.
            </p>
          ) : (
            category.dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))
          )}
        </section>
      ))}

      {categories.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          La carta esta vacia.
        </div>
      )}
    </div>
  );
}
