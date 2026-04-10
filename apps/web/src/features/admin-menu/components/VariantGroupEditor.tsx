"use client";

import type { VariantGroup, VariantOption } from "@/features/menu/types/menu.types";

interface Props {
  groups: VariantGroup[];
  onChange: (groups: VariantGroup[]) => void;
}

function makeOption(): Omit<VariantOption, "id"> & { id: string } {
  return { id: `new-${Date.now()}-${Math.random()}`, name: "", priceAdjustment: 0, sortOrder: 0 };
}

function makeGroup(): Omit<VariantGroup, "id"> & { id: string } {
  return { id: `new-${Date.now()}-${Math.random()}`, name: "", required: true, sortOrder: 0, options: [] };
}

export function VariantGroupEditor({ groups, onChange }: Props) {
  function addGroup() {
    onChange([...groups, makeGroup()]);
  }

  function removeGroup(idx: number) {
    onChange(groups.filter((_, i) => i !== idx));
  }

  function updateGroup(idx: number, patch: Partial<VariantGroup>) {
    onChange(groups.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  }

  function addOption(groupIdx: number) {
    const group = groups[groupIdx];
    const newOption = { ...makeOption(), sortOrder: group.options.length };
    updateGroup(groupIdx, { options: [...group.options, newOption] });
  }

  function removeOption(groupIdx: number, optIdx: number) {
    const group = groups[groupIdx];
    updateGroup(groupIdx, { options: group.options.filter((_, i) => i !== optIdx) });
  }

  function updateOption(groupIdx: number, optIdx: number, patch: Partial<VariantOption>) {
    const group = groups[groupIdx];
    updateGroup(groupIdx, {
      options: group.options.map((o, i) => (i === optIdx ? { ...o, ...patch } : o)),
    });
  }

  return (
    <div className="space-y-4">
      {groups.map((group, gi) => (
        <div key={group.id} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor={`vg-name-${gi}`}>Nombre del grupo</label>
            <input
              id={`vg-name-${gi}`}
              aria-label="Nombre del grupo"
              type="text"
              value={group.name}
              onChange={(e) => updateGroup(gi, { name: e.target.value })}
              placeholder="Nombre del grupo (ej: Tamaño)"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              aria-label="Eliminar grupo"
              onClick={() => removeGroup(gi)}
              className="rounded-lg border border-border px-2 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Selección única obligatoria — el cliente elige una opción
          </p>

          <div className="space-y-2">
            {group.options.map((opt, oi) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => updateOption(gi, oi, { name: e.target.value })}
                  placeholder="Nombre de la opción (ej: Individual)"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">+€</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={opt.priceAdjustment}
                    onChange={(e) =>
                      updateOption(gi, oi, { priceAdjustment: parseFloat(e.target.value) || 0 })
                    }
                    className="w-20 rounded-lg border border-border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Eliminar opción"
                  onClick={() => removeOption(gi, oi)}
                  className="rounded-lg border border-border px-2 py-2 text-xs text-red-500 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addOption(gi)}
            className="text-xs font-medium text-primary hover:underline"
          >
            + Añadir opción
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="w-full rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        + Añadir grupo de variantes
      </button>
    </div>
  );
}
