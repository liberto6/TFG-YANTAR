"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface OperatingHourDto {
  id: string;
  dayOfWeek: number; // 0=Domingo, 1=Lunes ... 6=Sabado
  openTime: string;  // "HH:MM"
  closeTime: string;
  isClosed: boolean;
}

export interface SetHoursData {
  hours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const DEFAULT_HOURS: SetHoursData["hours"] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  dayOfWeek: day,
  openTime: "09:00",
  closeTime: "22:00",
  isClosed: day === 0,
}));

export function useOperatingHours(branchId: string | undefined) {
  return useQuery({
    queryKey: ["operating-hours", branchId],
    queryFn: () => api.get<OperatingHourDto[]>(`/admin/company/branches/${branchId}/hours`),
    enabled: !!branchId,
  });
}

export function useSetOperatingHours(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SetHoursData) =>
      api.put<OperatingHourDto[]>(`/admin/company/branches/${branchId}/hours`, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["operating-hours", branchId] }),
  });
}
