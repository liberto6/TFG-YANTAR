"use client";

import { useState, useEffect, useRef } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EmptyMenuIllustration,
  NoResultsIllustration,
} from "@/components/illustrations";
import { useMenu } from "@/features/menu/hooks/use-menu";
import { useAllergenFilter } from "@/features/menu/hooks/use-allergen-filter";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CategoryNav } from "@/features/menu/components/CategoryNav";
import { DishCard } from "@/features/menu/components/DishCard";
import { AllergenFilter } from "@/features/menu/components/AllergenFilter";
import { DailyGreeting } from "@/features/menu/components/DailyGreeting";

// Header customer (h-14 = 56px) + CategoryNav sticky (~48px) + 8px de aire
const SCROLL_OFFSET_PX = 112;

export default function MenuPage() {
  const { excluded, excludedList, toggle, clear, allergens } =
    useAllergenFilter();
  const { data, isLoading, isError } = useMenu(excludedList);
  const { user } = useAuth();

  const categories = data?.categories ?? [];
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showAllergens, setShowAllergens] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  // Bloquea el observer durante un scroll programático para que no pelee
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  function scrollToCategory(id: string) {
    setActiveCategoryId(id);
    isProgrammaticScroll.current = true;
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Liberar después de la animación de scroll
    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 700);
  }

  // IntersectionObserver: detecta qué categoría está visible al hacer scroll manual
  useEffect(() => {
    if (categories.length === 0) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        // De las secciones intersecting, elegir la que está más arriba en el viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).dataset.categoryId;
          if (id) setActiveCategoryId(id);
        }
      },
      {
        // El "trigger line" cae justo debajo del CategoryNav sticky
        rootMargin: `-${SCROLL_OFFSET_PX + 16}px 0px -55% 0px`,
        threshold: 0,
      },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-body-sm text-muted-foreground">
        No se pudo cargar la carta. Inténtalo de nuevo.
      </div>
    );
  }

  const totalVisibleDishes = categories.reduce(
    (acc, c) => acc + c.dishes.length,
    0,
  );
  const filteredOutAll = totalVisibleDishes === 0 && excluded.size > 0;

  return (
    <div className="space-y-4">
      <DailyGreeting name={user?.displayName} />

      <CategoryNav
        categories={categories}
        activeId={activeCategoryId}
        onSelect={scrollToCategory}
      />

      <div>
        <button
          onClick={() => setShowAllergens((v) => !v)}
          aria-expanded={showAllergens}
          aria-controls="allergen-filter-panel"
          className="inline-flex items-center gap-1.5 rounded-md text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Filter size={14} />
          {showAllergens ? "Ocultar" : "Filtrar"} alérgenos
          {excluded.size > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {excluded.size}
            </span>
          )}
        </button>
        {showAllergens && (
          <div id="allergen-filter-panel" className="mt-2 animate-fade-in">
            <AllergenFilter
              allergens={allergens}
              excluded={excluded}
              onToggle={toggle}
              onClear={clear}
            />
          </div>
        )}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          illustration={<EmptyMenuIllustration />}
          title="La carta está en preparación"
          description="El restaurante todavía no ha publicado platos. Vuelve en un rato."
        />
      ) : filteredOutAll ? (
        <EmptyState
          tone="warning"
          illustration={<NoResultsIllustration />}
          title="Ningún plato cumple tus filtros"
          description={
            excluded.size === 1
              ? "Tienes 1 alérgeno excluido. Quítalo para ver más opciones."
              : `Tienes ${excluded.size} alérgenos excluidos. Quita alguno para ver más opciones.`
          }
          action={
            <Button variant="outline" size="sm" onClick={clear}>
              Quitar todos los filtros
            </Button>
          }
        />
      ) : (
        categories.map((category) => (
          <section
            key={category.id}
            data-category-id={category.id}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            className="space-y-3"
            style={{ scrollMarginTop: `${SCROLL_OFFSET_PX}px` }}
          >
            <h2 className="text-h3 text-foreground">{category.name}</h2>

            {category.dishes.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">
                No hay platos disponibles en esta categoría
                {excluded.size > 0 ? " con los filtros aplicados" : ""}.
              </p>
            ) : (
              category.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))
            )}
          </section>
        ))
      )}
    </div>
  );
}
