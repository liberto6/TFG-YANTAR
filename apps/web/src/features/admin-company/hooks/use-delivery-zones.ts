"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface GeoPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface DeliveryZoneDto {
  id: string;
  branchId: string;
  companyId: string;
  name: string;
  postalCodes: string[];
  minOrderAmount: number;
  deliveryFee: number;
  estimatedTimeMinutes: number;
  isActive: boolean;
  polygon: GeoPolygon | null;
}

export interface CreateZoneData {
  name: string;
  postalCodes: string[];
  minOrderAmount: number;
  deliveryFee: number;
  estimatedTimeMinutes: number;
}

export function useDeliveryZones(branchId: string) {
  return useQuery({
    queryKey: ["admin-delivery-zones", branchId],
    queryFn: () =>
      api.get<DeliveryZoneDto[]>(
        `/admin/company/branches/${branchId}/delivery-zones`,
      ),
    enabled: !!branchId,
  });
}

export function useCreateZone(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateZoneData) =>
      api.post<DeliveryZoneDto>(
        `/admin/company/branches/${branchId}/delivery-zones`,
        data,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin-delivery-zones", branchId],
      }),
  });
}

export function useUpdateZone(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateZoneData>;
    }) => api.patch<DeliveryZoneDto>(`/admin/company/delivery-zones/${id}`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin-delivery-zones", branchId],
      }),
  });
}

export function useDeleteZone(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/admin/company/delivery-zones/${id}`),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin-delivery-zones", branchId],
      }),
  });
}

export function useUpdateZonePolygon(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      polygon,
    }: {
      id: string;
      polygon: GeoPolygon | null;
    }) =>
      api.patch<DeliveryZoneDto>(
        `/admin/company/delivery-zones/${id}/polygon`,
        { polygon },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin-delivery-zones", branchId],
      }),
  });
}
