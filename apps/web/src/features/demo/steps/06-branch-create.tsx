"use client";

import { Bike, MapPin, ShoppingBag } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { useTyping } from "../hooks/use-typing";
import { AdminSidebar } from "./04-admin-empty";
import { DEMO_BRANCH } from "../data/napoli-fixtures";

/**
 * Paso 6 — Ana crea su primera sede. Tipea nombre, slug y dirección, y
 * activa los dos modos de servicio (PICKUP + DELIVERY).
 */
export function Step06BranchCreate() {
  const name = useTyping(DEMO_BRANCH.name, { startDelay: 400, speed: 55 });
  const slug = useTyping(DEMO_BRANCH.slug, {
    startDelay: name.totalMs + 300,
    speed: 70,
  });
  const address = useTyping(DEMO_BRANCH.address, {
    startDelay: name.totalMs + slug.totalMs + 400,
    speed: 35,
  });

  return (
    <DemoChapter url="napoli.yantar.app/admin/branches/new">
      <div className="flex">
        <AdminSidebar active="branches" />
        <div className="flex-1 space-y-5 p-6">
          <div>
            <h1 className="text-h2 text-foreground">Nueva sucursal</h1>
            <p className="text-body-sm text-muted-foreground">
              Cada sucursal tiene su slug propio para acceso directo:
              <code className="ml-1 rounded bg-secondary px-1 py-0.5 text-caption text-foreground">
                napoli.yantar.app/&lt;slug&gt;
              </code>
            </p>
          </div>

          <form className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <span className="text-foreground">{name.text}</span>
              {!name.done && <Caret />}
            </Field>

            <Field label="Slug">
              <span className="text-muted-foreground">napoli.yantar.app/</span>
              <span className="text-foreground">{slug.text}</span>
              {name.done && !slug.done && <Caret />}
            </Field>

            <Field label="Dirección" full>
              <MapPin size={14} className="mr-1 text-muted-foreground" />
              <span className="text-foreground">{address.text}</span>
              {slug.done && !address.done && <Caret />}
            </Field>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-caption text-muted-foreground">
                Modos de servicio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <ModeChip icon={<ShoppingBag size={14} />} label="Recogida en local" active />
                <ModeChip icon={<Bike size={14} />} label="Reparto a domicilio" active />
              </div>
            </div>
          </form>

          <div className="flex justify-end">
            <button
              disabled
              className={[
                "inline-flex h-10 items-center rounded-md px-5 text-body-sm font-medium transition-all",
                address.done
                  ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                  : "bg-secondary text-muted-foreground",
              ].join(" ")}
            >
              Crear sucursal
            </button>
          </div>
        </div>
      </div>
    </DemoChapter>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={["space-y-1.5", full ? "sm:col-span-2" : ""].join(" ")}>
      <label className="text-caption text-muted-foreground">{label}</label>
      <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-body-sm">
        {children}
      </div>
    </div>
  );
}

function Caret() {
  return <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary" />;
}

function ModeChip({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-md border px-3 py-2 text-body-sm",
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-surface text-muted-foreground",
      ].join(" ")}
    >
      {icon}
      {label}
    </div>
  );
}
