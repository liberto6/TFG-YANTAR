"use client";

import { ChefHat, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { DEMO_OWNER, DEMO_COMPANY } from "../data/napoli-fixtures";

/**
 * Paso 4 — Ana entra al panel admin recién creado. Todo a cero.
 */
export function Step04AdminEmpty() {
  return (
    <DemoChapter url="napoli.yantar.app/admin/dashboard">
      <div className="flex">
        <AdminSidebar active="dashboard" />
        <div className="flex-1 space-y-5 p-6">
          <div>
            <h1 className="text-h1 text-foreground">
              Hola, {DEMO_OWNER.name.split(" ")[0]}
            </h1>
            <p className="text-body-sm text-muted-foreground">
              Bienvenida al panel de {DEMO_COMPANY.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi icon={<ShoppingBag size={14} />} label="Pedidos hoy" value="0" />
            <Kpi icon={<ChefHat size={14} />} label="Entregados" value="0" />
            <Kpi icon={<TrendingUp size={14} />} label="Ingresos" value="0,00 €" />
            <Kpi icon={<Package size={14} />} label="Ticket medio" value="—" />
          </div>

          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <p className="text-body text-foreground">Aún no hay pedidos.</p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Configura tu carta y comparte tu URL para empezar a recibirlos.
            </p>
          </div>
        </div>
      </div>
    </DemoChapter>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center gap-1.5 text-caption text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-h3 text-foreground tabular-nums">{value}</p>
    </div>
  );
}

export function AdminSidebar({ active }: { active: string }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "menu", label: "Carta" },
    { id: "branches", label: "Sucursales" },
    { id: "settings", label: "Ajustes" },
    { id: "loyalty", label: "Fidelización" },
  ];
  return (
    <aside className="w-44 shrink-0 space-y-0.5 border-r border-border bg-surface/40 p-3">
      <p className="px-2 pb-2 text-caption uppercase tracking-wider text-muted-foreground">
        Admin
      </p>
      {items.map((it) => (
        <div
          key={it.id}
          className={[
            "rounded-md px-2 py-1.5 text-body-sm transition-colors",
            it.id === active
              ? "bg-primary/10 font-medium text-primary"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {it.label}
        </div>
      ))}
    </aside>
  );
}
