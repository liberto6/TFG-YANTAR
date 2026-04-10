"use client";

import { Button } from "@/components/ui/button";
import type { AllergenCode } from "../hooks/use-allergen-filter";

interface Allergen {
  code: AllergenCode;
  label: string;
}

interface AllergenFilterProps {
  allergens: readonly Allergen[];
  excluded: Set<AllergenCode>;
  onToggle: (code: AllergenCode) => void;
  onClear: () => void;
}

export function AllergenFilter({
  allergens,
  excluded,
  onToggle,
  onClear,
}: AllergenFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Filtrar alergenos
        </p>
        {excluded.size > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {allergens.map((a) => (
          <Button
            key={a.code}
            size="sm"
            variant={excluded.has(a.code) ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => onToggle(a.code)}
          >
            {excluded.has(a.code) ? "✕ " : ""}
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
