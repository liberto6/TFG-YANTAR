"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
} from "@/lib/order-status";
import { BranchSelectorBar } from "@/features/operativo/components/BranchSelectorBar";
import { useSelectedBranch } from "@/features/operativo/hooks/use-selected-branch";
import { useDashboardStats } from "@/features/admin-dashboard/hooks/use-dashboard-stats";
import { OnboardingChecklist } from "@/features/admin-dashboard/components/OnboardingChecklist";
import { StatValue } from "@/features/admin-dashboard/components/StatValue";
import type { Order, OrderStatus } from "@/features/orders/types/order.types";

function useActiveOrders(branchId: string | null) {
  return useQuery({
    queryKey: ["admin-active-orders", branchId],
    queryFn: () => api.get<Order[]>(`/admin/orders/active?branchId=${branchId}`),
    refetchInterval: 10000,
    enabled: !!branchId,
  });
}

export default function DashboardPage() {
  const { selectedBranchId } = useSelectedBranch();
  const { data: stats, isLoading: statsLoading } = useDashboardStats(selectedBranchId);
  const { data: activeOrders, isLoading: ordersLoading } = useActiveOrders(selectedBranchId);

  const statCards: Array<{
    label: string;
    value: number;
    format: "number" | "currency";
    Icon: typeof ClipboardList;
    iconClass: string;
  }> = [
    {
      label: "Pedidos hoy",
      value: stats?.ordersTotal ?? 0,
      format: "number",
      Icon: ClipboardList,
      iconClass: "bg-info/10 text-info",
    },
    {
      label: "Entregados hoy",
      value: stats?.deliveredCount ?? 0,
      format: "number",
      Icon: CheckCircle2,
      iconClass: "bg-success/10 text-success",
    },
    {
      label: "Ingresos hoy",
      value: stats?.revenue ?? 0,
      format: "currency",
      Icon: TrendingUp,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      label: "Ticket medio",
      value: stats?.avgTicket ?? 0,
      format: "currency",
      Icon: Receipt,
      iconClass: "bg-accent/10 text-accent",
    },
  ];

  const active = activeOrders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Dashboard</h2>
          <p className="text-body-sm text-muted-foreground">
            Resumen de pedidos en tu restaurante
          </p>
        </div>
        <BranchSelectorBar />
      </div>

      <OnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, format, Icon, iconClass }, i) => (
          <Card
            key={label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <CardContent className="flex items-start justify-between gap-3 pt-6">
              <div className="min-w-0">
                <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-h2 text-foreground tabular-nums">
                  {statsLoading ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    <StatValue value={value} format={format} />
                  )}
                </p>
              </div>
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
              >
                <Icon size={20} />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-h3 text-foreground">Pedidos activos</h3>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-body-sm font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : active.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="rounded-full bg-secondary p-3 text-muted-foreground">
                <ClipboardList size={24} />
              </div>
              <p className="text-body-sm text-muted-foreground">
                No hay pedidos activos ahora mismo
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {active.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-secondary/40 -mx-2 px-2 rounded-md"
                >
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "producto" : "productos"} ·{" "}
                      <span className="tabular-nums">{order.total.toFixed(2)} €</span>
                    </p>
                  </div>
                  <Badge
                    variant={ORDER_STATUS_VARIANT[order.status as OrderStatus]}
                    dot
                  >
                    {ORDER_STATUS_LABEL[order.status as OrderStatus]}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
