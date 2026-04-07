"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import type { Order } from "@/features/orders/types/order.types";

const BRANCH_ID = process.env.NEXT_PUBLIC_BRANCH_ID!;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente", ACCEPTED: "Aceptado", PREPARING: "Preparando",
  READY: "Listo", DELIVERED: "Entregado", REJECTED: "Rechazado", CANCELLED: "Cancelado",
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-orange-100 text-orange-700", READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-gray-100 text-gray-600", REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

function useActiveOrders() {
  return useQuery({
    queryKey: ["admin-active-orders", BRANCH_ID],
    queryFn: () => api.get<Order[]>(`/admin/orders/active?branchId=${BRANCH_ID}`),
    refetchInterval: 10000,
    enabled: !!BRANCH_ID,
  });
}

export default function DashboardPage() {
  const { data: orders, isLoading } = useActiveOrders();
  const active = orders?.filter((o) => ["PENDING","ACCEPTED","PREPARING","READY"].includes(o.status)) ?? [];
  const delivered = orders?.filter((o) => o.status === "DELIVERED") ?? [];
  const revenue = delivered.reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: "Pedidos activos", value: active.length },
    { label: "Entregados hoy", value: delivered.length },
    { label: "Ingresos (entregados)", value: `${revenue.toFixed(2)} €` },
    { label: "Pendientes de confirmar", value: orders?.filter((o) => o.status === "PENDING").length ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Resumen de pedidos en tu restaurante</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Pedidos activos</h3>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-12 animate-pulse rounded bg-muted" />)}</div>
          ) : active.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay pedidos activos ahora mismo</p>
          ) : (
            <div className="divide-y divide-border">
              {active.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">#{order.id.slice(0,8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{order.items.length} items · {order.total.toFixed(2)} €</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
