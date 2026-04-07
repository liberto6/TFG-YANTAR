"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface RewardDto {
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

export function useAdminRewards() {
  return useQuery({
    queryKey: ["admin-rewards"],
    queryFn: () => api.get<RewardDto[]>("/admin/loyalty/rewards"),
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      api.post<RewardDto>("/admin/loyalty/rewards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
    },
  });
}

export function useUpdateReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.put<RewardDto>(`/admin/loyalty/rewards/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
    },
  });
}

export function useDeleteReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/loyalty/rewards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
    },
  });
}
