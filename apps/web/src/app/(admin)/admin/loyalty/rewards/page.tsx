"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/lib/confirm-provider";
import {
  useAdminRewards,
  useCreateReward,
  useDeleteReward,
  useUpdateReward,
} from "@/features/admin-loyalty/hooks/use-admin-rewards";

const REWARD_TYPE_LABELS = {
  DISCOUNT_FIXED: "Descuento fijo (€)",
  DISCOUNT_PERCENT: "Descuento porcentual (%)",
  FREE_ITEM: "Producto gratis",
};

export default function RewardsPage() {
  const { data: rewards, isLoading } = useAdminRewards();
  const createMutation = useCreateReward();
  const updateMutation = useUpdateReward();
  const deleteMutation = useDeleteReward();
  const confirm = useConfirm();

  async function askDelete(rewardId: string, rewardName: string) {
    const ok = await confirm({
      title: `¿Eliminar la recompensa "${rewardName}"?`,
      description:
        "Los clientes ya no podrán canjearla. Los canjes anteriores se mantienen en su historial.",
      confirmLabel: "Eliminar recompensa",
      variant: "danger",
    });
    if (ok) deleteMutation.mutate(rewardId);
  }

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"DISCOUNT_FIXED" | "DISCOUNT_PERCENT" | "FREE_ITEM">(
    "DISCOUNT_FIXED",
  );
  const [pointsCost, setPointsCost] = useState("");
  const [value, setValue] = useState("");
  const [stock, setStock] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate() {
    setFormError(null);
    if (!name.trim() || !pointsCost || !value.trim()) {
      setFormError("Nombre, coste en puntos y valor son obligatorios");
      return;
    }
    await createMutation.mutateAsync({
      name: name.trim(),
      type,
      pointsCost: parseInt(pointsCost),
      value: value.trim(),
      stock: stock ? parseInt(stock) : null,
    });
    setName(""); setPointsCost(""); setValue(""); setStock("");
    setShowForm(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Recompensas</h2>
          <p className="text-sm text-muted-foreground">
            Define las recompensas que pueden canjear tus clientes
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "+ Nueva recompensa"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-4 pt-4">
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: 2€ de descuento" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tipo *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(REWARD_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Coste (puntos) *</label>
                <Input type="number" min="1" value={pointsCost} onChange={(e) => setPointsCost(e.target.value)} placeholder="200" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Valor *{" "}
                  <span className="font-normal text-muted-foreground">
                    {type === "DISCOUNT_FIXED" ? "(€)" : type === "DISCOUNT_PERCENT" ? "(%)" : "(dishId)"}
                  </span>
                </label>
                <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "DISCOUNT_FIXED" ? "2" : type === "DISCOUNT_PERCENT" ? "10" : "dish-uuid"} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Stock (vacío = ilimitado)</label>
                <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Ilimitado" />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creando…" : "Crear recompensa"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : rewards?.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No hay recompensas todavia.</p>
      ) : (
        <div className="space-y-2">
          {rewards?.map((reward) => (
            <Card key={reward.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{reward.name}</p>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${reward.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {reward.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reward.pointsCost} puntos · {REWARD_TYPE_LABELS[reward.type]} · valor: {reward.value}
                    {reward.stock !== null && ` · stock: ${reward.stock}`}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: reward.id, data: { isActive: !reward.isActive } })}
                    disabled={updateMutation.isPending}
                  >
                    {reward.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => askDelete(reward.id, reward.name)}
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
