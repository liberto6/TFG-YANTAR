"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTenantSlug } from "@/features/tenant/context/tenant-context";

export interface TimeSlot {
  label: string;
  value: string;
}

interface TimeSlotsResponse {
  date: string;
  slots: TimeSlot[];
}

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useTimeSlots(branchId: string, date?: string) {
  const companySlug = useTenantSlug();
  const targetDate = date ?? todayDateStr();

  return useQuery<TimeSlotsResponse>({
    queryKey: ["time-slots", companySlug, branchId, targetDate],
    queryFn: () =>
      api.get<TimeSlotsResponse>(
        `/companies/${companySlug}/branches/${branchId}/slots?date=${targetDate}`,
      ),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
