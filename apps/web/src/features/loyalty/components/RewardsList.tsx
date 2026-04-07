"use client";

import { useLoyaltyRewards, useLoyaltyBalance } from "../hooks/use-loyalty";
import type { LoyaltyReward } from "../hooks/use-loyalty";

function rewardTypeLabel(type: LoyaltyReward["type"], value: string): string {
  if (type === "DISCOUNT_PERCENT") return `${value}% de descuento`;
  if (type === "DISCOUNT_FIXED") return `${value} € de descuento`;
  return "Producto gratis";
}

export function RewardsList() {
  const { data: rewards, isLoading } = useLoyaltyRewards();
  const { data: balance } = useLoyaltyBalance();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!rewards?.length) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No hay recompensas disponibles aún.
      </p>
    );
  }

  const currentPoints = balance?.currentBalance ?? 0;

  return (
    <div className="space-y-2">
      {rewards.map((reward) => {
        const canRedeem = currentPoints >= reward.pointsCost;
        return (
          <div
            key={reward.id}
            className={`rounded-lg border p-3 ${
              canRedeem ? "border-primary/30 bg-primary/5" : "border-border bg-background opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{reward.name}</p>
                <p className="text-xs text-muted-foreground">
                  {rewardTypeLabel(reward.type, reward.value)}
                </p>
                {reward.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-semibold ${canRedeem ? "text-primary" : "text-muted-foreground"}`}>
                  {reward.pointsCost} pts
                </p>
                {reward.stock !== null && (
                  <p className="text-xs text-muted-foreground">{reward.stock} restantes</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
