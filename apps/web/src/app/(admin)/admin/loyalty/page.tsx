"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLoyaltyConfig, useUpdateLoyaltyConfig } from "@/features/admin-loyalty/hooks/use-loyalty-config";

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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fidelizacion</h2>
          <p className="text-sm text-muted-foreground">
            Configura el programa de puntos de tu restaurante
          </p>
        </div>
        <Link
          href="/admin/loyalty/rewards"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
        >
          Gestionar recompensas
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Estado del programa</h3>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isEnabled
              ? "El programa de puntos esta activo."
              : "El programa de puntos esta desactivado."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h3 className="font-medium">Reglas de acumulacion</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Puntos por euro gastado</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={pointsPerEuro}
                onChange={(e) => setPointsPerEuro(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ej: 1 punto por cada euro
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Valor del punto (centimos)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={pointValueCents}
                onChange={(e) => setPointValueCents(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ej: 1 centimo = 1 punto
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Minimo de puntos para canjear</label>
            <Input
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
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Guardando..." : "Guardar configuracion"}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Guardado correctamente</span>
        )}
      </div>
    </div>
  );
}
