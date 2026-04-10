"use client";

import { useRouter } from "next/navigation";
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
        <p className="text-muted-foreground">Inicia sesión para ver tu perfil.</p>
        <button
          onClick={() => router.push("/login")}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Iniciar sesión
        </button>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/menu");
  }

  const recentHistory = history?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6 pb-6">
      {/* User info */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          {user?.displayName?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="font-semibold text-foreground">{user?.displayName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Points summary */}
      {balance && (
        <div className="rounded-xl bg-primary px-5 py-4 text-white">
          <p className="text-sm font-medium opacity-80">Puntos disponibles</p>
          <p className="mt-0.5 text-3xl font-bold">{balance.currentBalance}</p>
          <div className="mt-2 flex gap-4 text-xs opacity-70">
            <span>Ganados: {balance.totalPointsEarned}</span>
            <span>Canjeados: {balance.totalPointsRedeemed}</span>
          </div>
        </div>
      )}

      {/* Available rewards */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">Recompensas disponibles</h2>
        <RewardsList />
      </div>

      {/* Points history */}
      {recentHistory.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold text-foreground">Últimos movimientos</h2>
          <div className="space-y-2">
            {recentHistory.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="text-sm text-foreground">{tx.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "EARNED" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.type === "EARNED" ? "+" : "−"}{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
