"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export type ServiceMode = "DELIVERY" | "PICKUP" | "DINE_IN";

export interface BranchDto {
  id: string;
  companyId: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  serviceModes: ServiceMode[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchData {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  serviceModes: ServiceMode[];
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  serviceModes?: ServiceMode[];
}

export function useAdminBranches() {
  return useQuery({
    queryKey: ["admin-branches"],
    queryFn: () => api.get<BranchDto[]>("/admin/company/branches"),
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchData) =>
      api.post<BranchDto>("/admin/company/branches", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-branches"] }),
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchData }) =>
      api.patch<BranchDto>(`/admin/company/branches/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-branches"] }),
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/company/branches/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-branches"] }),
  });
}
