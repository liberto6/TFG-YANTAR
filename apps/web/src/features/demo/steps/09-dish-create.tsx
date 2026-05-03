"use client";

import { Check } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { useTyping } from "../hooks/use-typing";
import { AdminSidebar } from "./04-admin-empty";
import { DEMO_DISHES, DEMO_VARIANTS, DEMO_MODIFIERS } from "../data/napoli-fixtures";

/**
 * Paso 9 — Ana crea su pizza Pepperoni: nombre, descripción, precio,
 * alérgenos, variantes de tamaño y 3 modificadores. Lo más denso de la demo
 * porque ilustra todo el potencial del editor de carta.
 */
export function Step09DishCreate() {
  const dish = DEMO_DISHES[1]!; // Pepperoni
  const name = useTyping(dish.name, { startDelay: 400, speed: 70 });
  const desc = useTyping(dish.description, {
    startDelay: name.totalMs + 300,
    speed: 30,
  });
  const price = useTyping(dish.basePrice.toFixed(2), {
    startDelay: name.totalMs + desc.totalMs + 400,
    speed: 90,
  });

  return (
    <DemoChapter url="napoli.yantar.app/admin/menu/new">
      <div className="flex">
        <AdminSidebar active="menu" />
        <div className="flex-1 space-y-5 p-6">
          <div>
            <h1 className="text-h2 text-foreground">Nuevo plato</h1>
            <p className="text-body-sm text-muted-foreground">
              Define el plato y sus variantes en una sola pantalla.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground">Nombre</label>
              <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-body-sm">
                <span className="text-foreground">{name.text}</span>
                {!name.done && <Caret />}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground">Precio base</label>
              <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-body-sm">
                <span className="text-foreground">{price.text}</span>
                {desc.done && !price.done && <Caret />}
                <span className="ml-1 text-muted-foreground">€</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-muted-foreground">Descripción</label>
            <div className="flex min-h-[44px] items-start rounded-md border border-border bg-background px-3 py-2 text-body-sm">
              <span className="text-foreground">{desc.text}</span>
              {name.done && !desc.done && <Caret />}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption text-muted-foreground">
              Alérgenos (Reglamento UE 1169/2011)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {dish.allergens.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-caption text-foreground"
                >
                  <Check size={10} /> {a}
                </span>
              ))}
              {["EGGS", "NUTS", "FISH", "SOY"].map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-border bg-surface px-2 py-0.5 text-caption text-muted-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Variantes (tamaño)" subtitle="Una sola opción obligatoria">
              {DEMO_VARIANTS.map((v) => (
                <Row
                  key={v.id}
                  label={v.name}
                  value={
                    v.priceAdjustment === 0
                      ? "—"
                      : v.priceAdjustment > 0
                        ? `+${v.priceAdjustment.toFixed(2)} €`
                        : `${v.priceAdjustment.toFixed(2)} €`
                  }
                />
              ))}
            </Card>
            <Card title="Modificadores (extras)" subtitle="Selección múltiple">
              {DEMO_MODIFIERS.map((m) => (
                <Row
                  key={m.id}
                  label={m.name}
                  value={`+${m.extraPrice.toFixed(2)} €`}
                />
              ))}
            </Card>
          </div>
        </div>
      </div>
    </DemoChapter>
  );
}

function Caret() {
  return <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary" />;
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
      <div>
        <p className="text-body-sm font-medium text-foreground">{title}</p>
        <p className="text-caption text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-background px-2 py-1.5 text-body-sm">
      <span className="text-foreground">{label}</span>
      <span className="font-mono text-muted-foreground">{value}</span>
    </div>
  );
}
