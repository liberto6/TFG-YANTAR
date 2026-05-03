"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Gift } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useLoyaltyConfig,
  useUpdateLoyaltyConfig,
} from "@/features/admin-loyalty/hooks/use-loyalty-config";

export default function LoyaltyPage() {
  const { data: config, isLoading } = useLoyaltyConfig();
  const updateMutation = useUpdateLoyaltyConfig();

  const [pointsPerEuro, setPointsPerEuro] = useState("1");
  const [pointValueCents, setPointValueCents] = useState("1");
  const [minRedeemPoints, setMinRedeemPoints] = useState("100");
  const [isEnabled, setIsEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setPointsPerEuro(config.pointsPerEuro.toString());
      setPointValueCents(config.pointValueCents.toString());
      setMinRedeemPoints(config.minRedeemPoints.toString());
      setIsEnabled(config.isEnabled);
    }
  }, [config]);

  async function handleSave() {
    await updateMutation.mutateAsync({
      pointsPerEuro: parseFloat(pointsPerEuro),
      pointValueCents: parseFloat(pointValueCents),
      minRedeemPoints: parseInt(minRedeemPoints),
      isEnabled,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Fidelización</h2>
          <p className="text-body-sm text-muted-foreground">
            Configura el programa de puntos de tu restaurante
          </p>
        </div>
        <Link
          href="/admin/loyalty/rewards"
          className="inline-flex h-10 items-center gap-1.5 self-start rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Gift size={16} /> Gestionar recompensas
        </Link>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-6">
          <div>
            <p className="text-body font-medium text-foreground">Estado del programa</p>
            <p className="text-body-sm text-muted-foreground">
              {isEnabled
                ? "Los clientes acumulan puntos en sus pedidos."
                : "El programa está pausado. Los pedidos no generan puntos."}
            </p>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            aria-label="Activar programa de fidelización"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-h3 text-foreground">Reglas de acumulación</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="points-per-euro">Puntos por euro gastado</Label>
              <Input
                id="points-per-euro"
                type="number"
                step="0.1"
                min="0"
                value={pointsPerEuro}
                onChange={(e) => setPointsPerEuro(e.target.value)}
              />
              <p className="text-caption text-muted-foreground">Ej: 1 punto por cada euro</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="point-value">Valor del punto (céntimos)</Label>
              <Input
                id="point-value"
                type="number"
                step="0.1"
                min="0"
                value={pointValueCents}
                onChange={(e) => setPointValueCents(e.target.value)}
              />
              <p className="text-caption text-muted-foreground">Ej: 1 céntimo = 1 punto</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="min-redeem">Mínimo de puntos para canjear</Label>
            <Input
              id="min-redeem"
              type="number"
              min="1"
              value={minRedeemPoints}
              onChange={(e) => setMinRedeemPoints(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={updateMutation.isPending}>
          {updateMutation.isPending ? "Guardando…" : "Guardar configuración"}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-body-sm font-medium text-success">
            <Check size={14} /> Guardado correctamente
          </span>
        )}
      </div>
    </div>
  );
}
