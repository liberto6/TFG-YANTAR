"use client";

import { useRouter } from "next/navigation";
import { LogOut, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useLoyaltyBalance, useLoyaltyHistory } from "@/features/loyalty/hooks/use-loyalty";
import { RewardsList } from "@/features/loyalty/components/RewardsList";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { data: balance } = useLoyaltyBalance();
  const { data: history } = useLoyaltyHistory();

  if (!isAuthenticated) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-body-sm text-muted-foreground">Inicia sesión para ver tu perfil.</p>
        <Button onClick={() => router.push("/login")}>Iniciar sesión</Button>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/menu");
  }

  const recentHistory = history?.slice(0, 5) ?? [];
  const initial = user?.displayName?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-h2 font-bold text-primary-foreground">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-body font-semibold text-foreground">{user?.displayName}</p>
          <p className="truncate text-body-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {balance && (
        <div className="overflow-hidden rounded-2xl bg-primary px-5 py-5 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-caption font-medium uppercase tracking-wider opacity-90">
                <Sparkles size={14} /> Puntos disponibles
              </p>
              <p className="mt-1 text-display tabular-nums">{balance.currentBalance}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-4 border-t border-white/20 pt-3 text-caption opacity-90">
            <span className="inline-flex items-center gap-1">
              <TrendingUp size={12} /> Ganados: {balance.totalPointsEarned}
            </span>
            <span className="inline-flex items-center gap-1">
              <TrendingDown size={12} /> Canjeados: {balance.totalPointsRedeemed}
            </span>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-h3 text-foreground">Recompensas disponibles</h2>
        <RewardsList />
      </div>

      {recentHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-h3 text-foreground">Últimos movimientos</h2>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {recentHistory.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-body-sm text-foreground">{tx.reason}</p>
                  <p className="text-caption text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-body-sm font-semibold tabular-nums ${
                    tx.type === "EARNED" ? "text-success" : "text-danger"
                  }`}
                >
                  {tx.type === "EARNED" ? "+" : "−"}
                  {tx.points} pts
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        className="w-full"
        leftIcon={<LogOut size={16} />}
        onClick={handleLogout}
      >
        Cerrar sesión
      </Button>
    </div>
  );
}
