import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface DashboardStats {
  ordersTotal: number;
  revenue: number;
  avgTicket: number;
  deliveredCount: number;
  activeCount: number;
  cancelledCount: number;
}

export function useDashboardStats(branchId: string | null, date?: Date) {
  const dateParam = date ? date.toISOString().split("T")[0] : undefined;

  return useQuery({
    queryKey: ["dashboard-stats", branchId, dateParam],
    queryFn: () => {
      const params = new URLSearchParams({ branchId: branchId! });
      if (dateParam) params.set("date", dateParam);
      return api.get<DashboardStats>(`/admin/orders/stats?${params.toString()}`);
    },
    enabled: !!branchId,
    refetchInterval: 30000,
  });
}
