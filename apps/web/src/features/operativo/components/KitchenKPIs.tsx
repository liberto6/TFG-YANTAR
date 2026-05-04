"use client";

import { useEffect, useMemo, useState } from "react";
import { AlarmClock, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Order } from "@/features/orders/types/order.types";

interface KitchenKPIsProps {
  orders: Order[];
}

/**
 * Strip de KPIs en vivo arriba del kanban operativo. Pensado para
 * lectura rápida desde 1-2 metros de distancia (cocina con tablet).
 *
 * Cuenta activos, pedidos retrasados (> 15 min sin avanzar) y el tiempo
 * medio desde recepción. Se refresca cada 30 s para mantener los números
 * vivos sin pegar al backend.
 */
export function KitchenKPIs({ orders }: KitchenKPIsProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    if (orders.length === 0) {
      return { active: 0, late: 0, avgMinutes: 0 };
    }
    const active = orders.length;
    const minutesArray = orders.map(
      (o) => (now - new Date(o.createdAt).getTime()) / 60000,
    );
    const late = minutesArray.filter((m) => m >= 15).length;
    const avgMinutes = Math.round(
      minutesArray.reduce((acc, m) => acc + m, 0) / minutesArray.length,
    );
    return { active, late, avgMinutes };
  }, [orders, now]);

  return (
    <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
      <Kpi
        icon={<Flame size={14} />}
        value={stats.active}
        label="activos"
        tone="primary"
      />
      <Kpi
        icon={<AlarmClock size={14} />}
        value={stats.late}
        label="retrasados"
        tone={stats.late > 0 ? "danger" : "muted"}
      />
      <Kpi
        icon={<Clock size={14} />}
        value={`${stats.avgMinutes}m`}
        label="tiempo medio"
        tone="muted"
      />
    </div>
  );
}

function Kpi({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  tone: "primary" | "danger" | "muted";
}) {
  const TONES: Record<typeof tone, string> = {
    primary: "border-primary/30 bg-primary/5 text-primary",
    danger: "border-danger/40 bg-danger/10 text-danger",
    muted: "border-border bg-surface text-foreground",
  };
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
        TONES[tone],
      )}
    >
      <span className="opacity-70">{icon}</span>
      <span className="font-mono text-h3 font-bold leading-none tabular-nums">
        {value}
      </span>
      <span className="text-caption uppercase tracking-wider opacity-70">
        {label}
      </span>
    </div>
  );
}
