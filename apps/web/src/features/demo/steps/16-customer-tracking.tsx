"use client";

import { useEffect, useState } from "react";
import { Bike, Check, ChefHat, Clock, ShoppingBag } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { DEMO_COMPANY, DEMO_ORDER } from "../data/napoli-fixtures";

/**
 * Paso 16 — Carlos sigue su pedido en directo. El stepper avanza solo,
 * imitando que la cocina va marcando estados y el WebSocket actualiza la
 * vista del comensal sin recargar.
 */
export function Step16CustomerTracking() {
  const STEPS = [
    { id: "PENDING", label: "Recibido", icon: ShoppingBag },
    { id: "ACCEPTED", label: "Aceptado", icon: Check },
    { id: "PREPARING", label: "En cocina", icon: ChefHat },
    { id: "READY", label: "Listo", icon: Bike },
  ];

  const [active, setActive] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((a) => (a < STEPS.length - 1 ? a + 1 : a));
    }, 2000);
    return () => clearInterval(interval);
  }, [STEPS.length]);

  return (
    <DemoChapter url="napoli.yantar.app/orders/..." device="mobile">
      <div className="min-h-[520px] bg-background">
        <header
          className="px-4 py-3 text-white"
          style={{ background: DEMO_COMPANY.colorPrimary }}
        >
          <p className="text-caption uppercase tracking-wider opacity-80">
            Pedido #1042
          </p>
          <p className="text-body-sm font-semibold">{DEMO_COMPANY.appName}</p>
        </header>

        <div className="space-y-5 p-5">
          <div>
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              Estado
            </p>
            <h1 className="text-h1 text-foreground">{STEPS[active]!.label}</h1>
            <p className="text-body-sm text-muted-foreground">
              <Clock size={11} className="mr-1 inline" />
              Hora estimada: {DEMO_ORDER.scheduledTime}
            </p>
          </div>

          <ol className="space-y-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < active;
              const current = i === active;
              return (
                <li
                  key={s.id}
                  className={[
                    "flex items-center gap-3 rounded-lg border bg-surface p-3 transition-all",
                    done
                      ? "border-success/40 opacity-90"
                      : current
                        ? "border-primary shadow-sm ring-2 ring-primary/20"
                        : "border-border opacity-60",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-full",
                      done
                        ? "bg-success/15 text-success"
                        : current
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="flex-1">
                    <p className="text-body-sm font-medium text-foreground">{s.label}</p>
                    {current && (
                      <p className="text-caption text-muted-foreground">
                        Actualizado en directo · WebSocket
                      </p>
                    )}
                  </div>
                  {done && <Check size={14} className="text-success" />}
                </li>
              );
            })}
          </ol>

          <div className="rounded-2xl border border-border bg-surface p-3">
            <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
              Resumen
            </p>
            <ul className="mt-1.5 space-y-0.5 text-caption">
              {DEMO_ORDER.items.map((it, i) => (
                <li key={i} className="text-foreground">
                  <span className="text-muted-foreground">{it.quantity}×</span>{" "}
                  {it.dishName}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-body-sm">
              <span className="text-muted-foreground">Total</span>
              <span
                className="font-semibold tabular-nums"
                style={{ color: DEMO_COMPANY.colorPrimary }}
              >
                {DEMO_ORDER.total.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </DemoChapter>
  );
}
