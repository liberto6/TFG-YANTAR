"use client";

import type { ModifierGroup, ModifierOption } from "@/features/menu/types/menu.types";

interface Props {
  groups: ModifierGroup[];
  onChange: (groups: ModifierGroup[]) => void;
}

function makeOption(): ModifierOption {
  return { id: `new-${Date.now()}-${Math.random()}`, name: "", extraPrice: 0, sortOrder: 0 };
}

function makeGroup(): ModifierGroup {
  return {
    id: `new-${Date.now()}-${Math.random()}`,
    name: "",
    required: false,
    selectionType: "MULTIPLE",
    minSelections: 0,
    maxSelections: null,
    sortOrder: 0,
    options: [],
  };
}

export function ModifierGroupEditor({ groups, onChange }: Props) {
  function addGroup() {
    onChange([...groups, makeGroup()]);
  }

  function removeGroup(idx: number) {
    onChange(groups.filter((_, i) => i !== idx));
  }

  function updateGroup(idx: number, patch: Partial<ModifierGroup>) {
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

  function updateOption(groupIdx: number, optIdx: number, patch: Partial<ModifierOption>) {
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
            <input
              type="text"
              value={group.name}
              aria-label="Nombre del grupo"
              onChange={(e) => updateGroup(gi, { name: e.target.value })}
              placeholder="Nombre del grupo (ej: Extras)"
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

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor={`mg-type-${gi}`} className="text-xs text-muted-foreground">
                Tipo de selección
              </label>
              <select
                id={`mg-type-${gi}`}
                aria-label="Tipo de selección"
                value={group.selectionType}
                onChange={(e) =>
                  updateGroup(gi, {
                    selectionType: e.target.value as "SINGLE" | "MULTIPLE",
                  })
                }
                className="rounded-lg border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="MULTIPLE">Múltiple</option>
                <option value="SINGLE">Única</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={group.required}
                  onChange={(e) => updateGroup(gi, { required: e.target.checked })}
                  className="rounded"
                />
                Obligatorio
              </label>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Mín:</span>
              <input
                type="number"
                min="0"
                value={group.minSelections}
                onChange={(e) =>
                  updateGroup(gi, { minSelections: parseInt(e.target.value) || 0 })
                }
                className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">Máx:</span>
              <input
                type="number"
                min="0"
                value={group.maxSelections ?? ""}
                placeholder="∞"
                onChange={(e) =>
                  updateGroup(gi, {
                    maxSelections: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            {group.options.map((opt, oi) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) => updateOption(gi, oi, { name: e.target.value })}
                  placeholder="Nombre de la opción (ej: Extra queso)"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">+€</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={opt.extraPrice}
                    onChange={(e) =>
                      updateOption(gi, oi, { extraPrice: parseFloat(e.target.value) || 0 })
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
        + Añadir grupo de modificadores
      </button>
    </div>
  );
}
