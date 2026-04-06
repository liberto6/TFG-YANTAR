"use client";

import { Button } from "@/components/ui/button";
import type { Category } from "../types/menu.types";

interface CategoryNavProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={activeId === cat.id ? "default" : "outline"}
          size="sm"
          className="shrink-0"
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </Button>
      ))}
    </nav>
  );
}
