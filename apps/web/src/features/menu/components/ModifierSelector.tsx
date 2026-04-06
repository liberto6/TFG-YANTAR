"use client";

import type { ModifierGroup } from "../types/menu.types";

interface ModifierSelectorProps {
  group: ModifierGroup;
  selectedIds: Set<string>;
  onToggle: (optionId: string) => void;
}

export function ModifierSelector({
  group,
  selectedIds,
  onToggle,
}: ModifierSelectorProps) {
  const selectedCount = group.options.filter((o) => selectedIds.has(o.id)).length;
  const isSingle = group.selectionType === "SINGLE";

  function handleChange(optionId: string) {
    if (isSingle) {
      // For single: deselect others in the group, select this one
      // We toggle the one clicked; if already selected, deselect
      if (selectedIds.has(optionId)) {
        onToggle(optionId);
      } else {
        // Deselect all others first, then select
        group.options.forEach((o) => {
          if (selectedIds.has(o.id)) onToggle(o.id);
        });
        onToggle(optionId);
      }
    } else {
      onToggle(optionId);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-foreground">{group.name}</h3>
        {group.required && (
          <span className="text-xs text-red-500 font-medium">Requerido</span>
        )}
        {group.maxSelections && (
          <span className="text-xs text-muted-foreground">
            (max {group.maxSelections})
          </span>
        )}
      </div>
      <div className="space-y-2">
        {group.options.map((option) => {
          const isSelected = selectedIds.has(option.id);
          const isDisabled =
            !isSelected &&
            group.maxSelections !== null &&
            selectedCount >= group.maxSelections;

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 ${
                isDisabled ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type={isSingle ? "radio" : "checkbox"}
                  name={group.id}
                  value={option.id}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => !isDisabled && handleChange(option.id)}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">{option.name}</span>
              </div>
              {option.extraPrice > 0 && (
                <span className="text-sm text-muted-foreground">
                  +{option.extraPrice.toFixed(2)} €
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
