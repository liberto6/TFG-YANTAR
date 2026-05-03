"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Dish } from "@/features/menu/types/menu.types";
import { useTenantSlug } from "@/features/tenant/context/tenant-context";

export function useAdminDishes(categoryId?: string) {
  const companySlug = useTenantSlug();
  const qs = categoryId ? `?categoryId=${categoryId}` : "";
  return useQuery({
    queryKey: ["admin-dishes", companySlug, categoryId],
    queryFn: () => api.get<Dish[]>(`/admin/menu/dishes${qs}`),
  });
}

export function useToggleAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dishId: string) =>
      api.patch<Dish>(`/admin/menu/dishes/${dishId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dishes"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useDeleteDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dishId: string) =>
      api.delete(`/admin/menu/dishes/${dishId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dishes"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useCreateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) =>
      api.post<Dish>("/admin/menu/dishes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dishes"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useUpdateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dishId, data }: { dishId: string; data: unknown }) =>
      api.put<Dish>(`/admin/menu/dishes/${dishId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dishes"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}
