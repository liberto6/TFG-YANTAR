"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { Category } from "../types/menu.types";

interface CategoryNavProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll horizontal: mantener el botón activo visible cuando cambia
  // (útil cuando IntersectionObserver detecta scroll manual)
  useEffect(() => {
    if (!activeId || !containerRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(
      `[data-cat-id="${activeId}"]`,
    );
    activeBtn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div
      className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <nav
        ref={containerRef}
        aria-label="Categorías"
        className="flex gap-2 overflow-x-auto scrollbar-hide"
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              data-cat-id={cat.id}
              onClick={() => onSelect(cat.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-body-sm font-medium",
                "transition-[background-color,color,transform] duration-150 ease-out-expo",
                "active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-foreground hover:bg-secondary/70",
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
