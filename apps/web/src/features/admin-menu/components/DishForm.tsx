"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminCategories } from "../hooks/use-admin-categories";
import { useCreateDish, useUpdateDish } from "../hooks/use-admin-dishes";
import { VariantGroupEditor } from "./VariantGroupEditor";
import { ModifierGroupEditor } from "./ModifierGroupEditor";
import type { Dish, VariantGroup, ModifierGroup } from "@/features/menu/types/menu.types";

const ALLERGEN_OPTIONS = [
  { code: "GLUTEN", label: "Gluten" },
  { code: "CRUSTACEANS", label: "Crustaceos" },
  { code: "EGGS", label: "Huevo" },
  { code: "FISH", label: "Pescado" },
  { code: "PEANUTS", label: "Cacahuetes" },
  { code: "SOY", label: "Soja" },
  { code: "DAIRY", label: "Lacteos" },
  { code: "NUTS", label: "Frutos secos" },
  { code: "CELERY", label: "Apio" },
  { code: "MUSTARD", label: "Mostaza" },
  { code: "SESAME", label: "Sesamo" },
  { code: "SULPHITES", label: "Sulfitos" },
  { code: "LUPIN", label: "Altramuces" },
  { code: "MOLLUSCS", label: "Moluscos" },
];

interface DishFormProps {
  dish?: Dish;
}

export function DishForm({ dish }: DishFormProps) {
  const router = useRouter();
  const { data: categories } = useAdminCategories();
  const createMutation = useCreateDish();
  const updateMutation = useUpdateDish();

  const [name, setName] = useState(dish?.name ?? "");
  const [description, setDescription] = useState(dish?.description ?? "");
  const [basePrice, setBasePrice] = useState(dish?.basePrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(dish?.categoryId ?? "");
  const [allergens, setAllergens] = useState<Set<string>>(
    new Set(dish?.allergenCodes ?? []),
  );
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>(
    dish?.variantGroups ?? [],
  );
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(
    dish?.modifierGroups ?? [],
  );
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!dish;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function toggleAllergen(code: string) {
    setAllergens((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      description: description || undefined,
      basePrice: parseFloat(basePrice),
      categoryId,
      allergenCodes: Array.from(allergens),
      variantGroups: variantGroups.map(({ id, ...rest }) => rest),
      modifierGroups: modifierGroups.map(({ id, ...rest }) => rest),
    };
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ dishId: dish.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/admin/menu");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el plato");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium">Informacion basica</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del plato"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Descripcion</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripcion del plato"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Precio base (€) *</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Categoria *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecciona categoria</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium">Alergenos</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => toggleAllergen(a.code)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  allergens.has(a.code)
                    ? "border-primary bg-primary text-white"
                    : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium">Variantes</h2>
          <p className="text-xs text-muted-foreground">
            Opciones exclusivas que cambian el precio base (ej: tamaño). El cliente elige una.
          </p>
        </CardHeader>
        <CardContent>
          <VariantGroupEditor groups={variantGroups} onChange={setVariantGroups} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium">Modificadores</h2>
          <p className="text-xs text-muted-foreground">
            Extras o eliminaciones opcionales (ej: sin cebolla, extra queso). Pueden ser múltiples.
          </p>
        </CardHeader>
        <CardContent>
          <ModifierGroupEditor groups={modifierGroups} onChange={setModifierGroups} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear plato"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/menu")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
