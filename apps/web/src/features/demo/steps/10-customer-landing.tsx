"use client";

import { Bike, ShoppingBag, Store } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { DEMO_BRANCH, DEMO_COMPANY } from "../data/napoli-fixtures";

/**
 * Paso 10 — Carlos llega a la web del restaurante. Ve la sede y elige
 * modalidad. Mobile-first, branding aplicado.
 */
export function Step10CustomerLanding() {
  return (
    <DemoChapter url="napoli.yantar.app" device="mobile">
      <div className="min-h-[520px] bg-background">
        <div
          className="flex items-center justify-center px-4 py-3 text-white"
          style={{ background: DEMO_COMPANY.colorPrimary }}
        >
          <span className="text-body-sm font-semibold">{DEMO_COMPANY.appName}</span>
        </div>

        <div className="space-y-5 px-5 py-6 text-center">
          <div className="space-y-1">
            <h1 className="text-h2 text-foreground">{DEMO_COMPANY.name}</h1>
            <p className="text-body-sm text-muted-foreground">
              {DEMO_COMPANY.welcomeMessage}
            </p>
          </div>

          <div className="space-y-3 text-left">
            <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
              ¿Desde qué local quieres pedir?
            </p>

            <button
              disabled
              className="flex w-full items-start gap-3 rounded-2xl border-2 border-primary bg-surface p-3 text-left shadow-sm"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Store size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body-sm font-medium text-foreground">
                  {DEMO_BRANCH.name}
                </p>
                <p className="text-caption text-muted-foreground">
                  {DEMO_BRANCH.address}
                </p>
                <div className="mt-1.5 flex gap-1">
                  <Tag icon={<ShoppingBag size={9} />} label="Recogida" />
                  <Tag icon={<Bike size={9} />} label="Domicilio" />
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-2 pt-2 text-left">
            <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
              ¿Cómo lo quieres recibir?
            </p>
            <ModeCard
              icon={<Bike size={18} />}
              title="Envío a domicilio"
              subtitle="Te lo llevamos a tu dirección"
              active
            />
            <ModeCard
              icon={<ShoppingBag size={18} />}
              title="Recoger en el local"
              subtitle="Sin gastos de envío"
            />
          </div>
        </div>
      </div>
    </DemoChapter>
  );
}

function Tag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
      {icon} {label}
    </span>
  );
}

function ModeCard({
  icon,
  title,
  subtitle,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-2xl border bg-surface p-3",
        active ? "border-accent shadow-sm" : "border-border",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          active ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {icon}
      </span>
      <div>
        <p className="text-body-sm font-medium text-foreground">{title}</p>
        <p className="text-caption text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
