"use client";

import Link from "next/link";
import {
  Bike,
  Building2,
  MapPin,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyBranchesIllustration } from "@/components/illustrations";
import { useConfirm } from "@/lib/confirm-provider";
import {
  useAdminBranches,
  useDeleteBranch,
} from "@/features/admin-company/hooks/use-admin-branches";

export default function BranchesPage() {
  const { data: branches, isLoading } = useAdminBranches();
  const deleteMutation = useDeleteBranch();
  const confirm = useConfirm();

  async function askDelete(branchId: string, branchName: string) {
    const ok = await confirm({
      title: `¿Eliminar "${branchName}"?`,
      description:
        "Esta sede dejará de estar disponible para nuevos pedidos. Los pedidos en curso no se ven afectados. Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar sede",
      variant: "danger",
    });
    if (ok) deleteMutation.mutate(branchId);
  }

  const SERVICE_ICON = {
    DELIVERY: Bike,
    PICKUP: ShoppingBag,
    DINE_IN: Building2,
  } as const;

  const SERVICE_LABEL = {
    DELIVERY: "Domicilio",
    PICKUP: "Recogida",
    DINE_IN: "Local",
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Sedes</h2>
          <p className="text-body-sm text-muted-foreground">
            Gestiona las ubicaciones de tu restaurante
          </p>
        </div>
        <Link
          href="/admin/branches/new"
          className="inline-flex h-10 items-center gap-1.5 self-start rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus size={16} /> Nueva sede
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !branches?.length ? (
        <EmptyState
          illustration={<EmptyBranchesIllustration />}
          title="Aún no tienes sedes"
          description="Tu primera sede define dónde se preparan los pedidos. Configura horarios, modos de servicio y zonas de reparto."
          action={
            <Link
              href="/admin/branches/new"
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.97]"
            >
              <Plus size={16} /> Crear primera sede
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {branches.map((branch, i) => (
            <Card
              key={branch.id}
              className="hover-lift animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-body font-medium text-foreground">{branch.name}</p>
                  <p className="inline-flex items-center gap-1.5 truncate text-body-sm text-muted-foreground">
                    <MapPin size={14} className="shrink-0" /> {branch.address}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {branch.serviceModes.map((mode) => {
                      const Icon = SERVICE_ICON[mode as keyof typeof SERVICE_ICON];
                      const label = SERVICE_LABEL[mode as keyof typeof SERVICE_LABEL] ?? mode;
                      return (
                        <span
                          key={mode}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground"
                        >
                          {Icon && <Icon size={11} />} {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/branches/${branch.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-transparent px-3 text-body-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Pencil size={14} /> Editar
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 size={14} />}
                    className="text-muted-foreground hover:bg-danger/10 hover:text-danger"
                    onClick={() => askDelete(branch.id, branch.name)}
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
