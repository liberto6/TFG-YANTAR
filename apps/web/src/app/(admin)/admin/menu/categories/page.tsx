"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/lib/confirm-provider";
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/features/admin-menu/hooks/use-admin-categories";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const confirm = useConfirm();
  const [newName, setNewName] = useState("");

  async function askDelete(catId: string, catName: string) {
    const ok = await confirm({
      title: `¿Eliminar la categoría "${catName}"?`,
      description:
        "Los platos de esta categoría no se borrarán, pero quedarán sin categoría asignada.",
      confirmLabel: "Eliminar categoría",
      variant: "danger",
    });
    if (ok) deleteMutation.mutate(catId);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName.trim() });
    setNewName("");
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-h1 text-foreground">Categorías</h2>
        <p className="text-body-sm text-muted-foreground">
          Organiza tu carta por categorías
        </p>
      </div>

      {/* Crear nueva */}
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la categoría"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()}>
          Crear
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categories?.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="flex items-center justify-between p-4">
                <p className="font-medium">{cat.name}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => askDelete(cat.id, cat.name)}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
