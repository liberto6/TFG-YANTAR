"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuth } from "@/features/auth/hooks/use-auth";

export interface LoyaltyBalance {
  currentBalance: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  type: "DISCOUNT_PERCENT" | "DISCOUNT_FIXED" | "FREE_ITEM";
  pointsCost: number;
  value: string;
  isActive: boolean;
  stock: number | null;
  isAvailable: boolean;
}

export interface PointsTransaction {
  id: string;
  type: "EARNED" | "REDEEMED";
  points: number;
  reason: string;
  createdAt: string;
}

export interface RedeemResult {
  discountValue: number;
  pointsUsed: number;
  remainingBalance: number;
}

export function useLoyaltyBalance() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["loyalty-balance"],
    queryFn: () => api.get<LoyaltyBalance>("/loyalty/balance"),
    enabled: isAuthenticated,
  });
}

export function useLoyaltyRewards() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: () => api.get<LoyaltyReward[]>("/loyalty/rewards"),
    enabled: isAuthenticated,
  });
}

export function useLoyaltyHistory() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["loyalty-history"],
    queryFn: () => api.get<PointsTransaction[]>("/loyalty/history"),
    enabled: isAuthenticated,
  });
}

export function useRedeemPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { rewardId?: string; points?: number }) =>
      api.post<RedeemResult>("/loyalty/redeem", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-balance"] });
    },
  });
}
