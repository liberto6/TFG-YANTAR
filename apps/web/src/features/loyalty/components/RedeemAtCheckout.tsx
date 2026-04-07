"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLoyaltyBalance, useLoyaltyRewards } from "../hooks/use-loyalty";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { LoyaltyReward } from "../hooks/use-loyalty";

interface RedeemAtCheckoutProps {
  onRewardSelected: (reward: LoyaltyReward | null) => void;
  selectedReward: LoyaltyReward | null;
}

function rewardLabel(reward: LoyaltyReward): string {
  if (reward.type === "DISCOUNT_PERCENT") return `${reward.value}% de descuento`;
  if (reward.type === "DISCOUNT_FIXED") return `${Number(reward.value).toFixed(2)} € de descuento`;
  return "Producto gratis";
}

export function RedeemAtCheckout({ onRewardSelected, selectedReward }: RedeemAtCheckoutProps) {
  const { isAuthenticated } = useAuth();
  const { data: balance } = useLoyaltyBalance();
  const { data: rewards } = useLoyaltyRewards();
  const [expanded, setExpanded] = useState(false);

  if (!isAuthenticated || !balance || balance.currentBalance === 0) return null;

  const availableRewards = (rewards ?? []).filter(
    (r) => r.isAvailable && balance.currentBalance >= r.pointsCost,
  );

  if (availableRewards.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div>
            <h2 className="font-medium text-foreground">Canjear puntos</h2>
            <p className="text-xs text-muted-foreground">
              Tienes <span className="font-semibold text-primary">{balance.currentBalance} puntos</span>
            </p>
          </div>
          <svg
            className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-2 pt-0">
          {selectedReward && (
            <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 text-sm">
              <span className="font-medium text-primary">
                Aplicado: {rewardLabel(selectedReward)} (−{selectedReward.pointsCost} pts)
              </span>
              <button
                type="button"
                onClick={() => onRewardSelected(null)}
                className="text-xs text-muted-foreground underline"
              >
                Quitar
              </button>
            </div>
          )}

          {!selectedReward &&
            availableRewards.map((reward) => (
              <button
                key={reward.id}
                type="button"
                onClick={() => onRewardSelected(reward)}
                className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div>
                  <p className="font-medium text-foreground">{reward.name}</p>
                  <p className="text-xs text-muted-foreground">{rewardLabel(reward)}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary">
                  {reward.pointsCost} pts
                </span>
              </button>
            ))}
        </CardContent>
      )}
    </Card>
  );
}
