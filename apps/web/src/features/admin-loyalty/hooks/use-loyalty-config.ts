"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface LoyaltyConfig {
  pointsPerEuro: number;
  pointValueCents: number;
  minRedeemPoints: number;
  isEnabled: boolean;
}

export function useLoyaltyConfig() {
  return useQuery({
    queryKey: ["loyalty-config"],
    queryFn: () => api.get<LoyaltyConfig | null>("/admin/loyalty/config"),
  });
}

export function useUpdateLoyaltyConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<LoyaltyConfig>) =>
      api.put<LoyaltyConfig>("/admin/loyalty/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-config"] });
    },
  });
}
