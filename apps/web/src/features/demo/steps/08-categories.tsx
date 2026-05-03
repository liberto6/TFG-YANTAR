"use client";

import type { ComponentType } from "react";
import { Coffee, IceCream2, Pizza, Plus, UtensilsCrossed, Wine } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { AdminSidebar } from "./04-admin-empty";
import { DEMO_CATEGORIES } from "../data/napoli-fixtures";

type IconType = ComponentType<{ size?: number | string }>;

/**
 * Paso 8 — Ana organiza las categorías de la carta. Las renderizamos como
 * tiles ordenados con su número de platos (todavía 0).
 */
export function Step08Categories() {
  const ICONS: Record<string, IconType> = {
    "demo-cat-1": Pizza as IconType,
    "demo-cat-2": UtensilsCrossed as IconType,
    "demo-cat-3": UtensilsCrossed as IconType,
    "demo-cat-4": Coffee as IconType,
    "demo-cat-5": IceCream2 as IconType,
  };

  return (
    <DemoChapter url="napoli.yantar.app/admin/menu/categories">
      <div className="flex">
        <AdminSidebar active="menu" />
        <div className="flex-1 space-y-5 p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-h2 text-foreground">Categorías</h1>
              <p className="text-body-sm text-muted-foreground">
                Organiza tus platos por secciones de la carta.
              </p>
            </div>
            <button
              disabled
              className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-body-sm font-medium text-primary-foreground shadow-sm"
            >
              <Plus size={14} /> Añadir
            </button>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DEMO_CATEGORIES.map((c, i) => {
              const Icon = ICONS[c.id] ?? (Wine as IconType);
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="text-caption text-muted-foreground">0 platos</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </DemoChapter>
  );
}
