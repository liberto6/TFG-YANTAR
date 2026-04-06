"use client";

import type { VariantGroup, VariantOption } from "../types/menu.types";

interface VariantSelectorProps {
  group: VariantGroup;
  selectedId: string | null;
  onSelect: (optionId: string) => void;
}

export function VariantSelector({
  group,
  selectedId,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-foreground">{group.name}</h3>
        {group.required && (
          <span className="text-xs text-red-500 font-medium">Requerido</span>
        )}
      </div>
      <div className="space-y-2">
        {group.options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name={group.id}
                value={option.id}
                checked={selectedId === option.id}
                onChange={() => onSelect(option.id)}
                className="accent-primary"
              />
              <span className="text-sm text-foreground">{option.name}</span>
            </div>
            {option.priceAdjustment !== 0 && (
              <span className="text-sm text-muted-foreground">
                {option.priceAdjustment > 0 ? "+" : ""}
                {option.priceAdjustment.toFixed(2)} €
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
