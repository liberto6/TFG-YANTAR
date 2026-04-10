import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

const COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG!;

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
  const targetDate = date ?? todayDateStr();

  return useQuery<TimeSlotsResponse>({
    queryKey: ["time-slots", branchId, targetDate],
    queryFn: () =>
      api.get<TimeSlotsResponse>(
        `/companies/${COMPANY_SLUG}/branches/${branchId}/slots?date=${targetDate}`,
      ),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
