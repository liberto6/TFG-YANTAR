"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useAdminDishes } from "@/features/admin-menu/hooks/use-admin-dishes";
import { useAdminCategories } from "@/features/admin-menu/hooks/use-admin-categories";
import { useAdminBranches } from "@/features/admin-company/hooks/use-admin-branches";
import { useCompanyConfig } from "@/features/admin-company/hooks/use-branding";

interface Step {
  label: string;
  href: string;
  cta: string;
  done: boolean;
}

export function OnboardingChecklist() {
  const { data: categories } = useAdminCategories();
  const { data: dishes } = useAdminDishes();
  const { data: branches } = useAdminBranches();
  const { data: config } = useCompanyConfig();

  const steps: Step[] = [
    {
      label: "Crea tu primera categoría",
      href: "/admin/menu/categories",
      cta: "Ir a categorías",
      done: (categories?.length ?? 0) > 0,
    },
    {
      label: "Añade tu primer plato",
      href: "/admin/menu/new",
      cta: "Crear plato",
      done: (dishes?.length ?? 0) > 0,
    },
    {
      label: "Configura una sede",
      href: "/admin/branches",
      cta: "Gestionar sedes",
      done: (branches?.length ?? 0) > 0,
    },
    {
      label: "Personaliza tu branding",
      href: "/admin/settings/branding",
      cta: "Editar branding",
      done: Boolean(config?.appName || config?.logoUrl || config?.colorPrimary),
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;

  // No mostrar si está todo hecho
  if (completed === total) return null;

  // Aún cargando datos: no parpadear
  if (
    categories === undefined ||
    dishes === undefined ||
    branches === undefined ||
    config === undefined
  ) {
    return null;
  }

  const next = steps.find((s) => !s.done);
  const percent = Math.round((completed / total) * 100);

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-h3 text-foreground">Empieza por aquí</h3>
            <p className="text-body-sm text-muted-foreground">
              Pasos básicos para tener tu restaurante listo para recibir pedidos
            </p>
          </div>
          <div className="text-right">
            <p className="text-h2 text-primary tabular-nums">
              {completed}/{total}
            </p>
            <p className="text-caption text-muted-foreground">completados</p>
          </div>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de configuración inicial"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                step.done
                  ? "bg-success text-white"
                  : step === next
                    ? "border-2 border-primary text-primary"
                    : "border border-border text-muted-foreground",
              )}
            >
              {step.done ? <Check size={14} /> : <Circle size={8} />}
            </span>
            <span
              className={cn(
                "flex-1 text-body-sm",
                step.done
                  ? "text-muted-foreground line-through"
                  : "font-medium text-foreground",
              )}
            >
              {step.label}
            </span>
            {!step.done && (
              <Link
                href={step.href}
                className="inline-flex items-center gap-1 text-body-sm font-medium text-primary hover:underline"
              >
                {step.cta} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
