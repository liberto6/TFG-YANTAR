"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminBranches, useDeleteBranch } from "@/features/admin-company/hooks/use-admin-branches";

export default function BranchesPage() {
  const { data: branches, isLoading } = useAdminBranches();
  const deleteMutation = useDeleteBranch();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sedes</h2>
          <p className="text-sm text-muted-foreground">Gestiona las ubicaciones de tu restaurante</p>
        </div>
        <Link
          href="/admin/branches/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
        >
          + Nueva sede
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : !branches?.length ? (
        <div className="py-12 text-center text-muted-foreground">
          No hay sedes. Crea la primera.
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((branch) => (
            <Card key={branch.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{branch.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{branch.address}</p>
                  <div className="mt-1 flex gap-1">
                    {branch.serviceModes.map((mode) => (
                      <span key={mode} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {mode === "DELIVERY" ? "Delivery" : mode === "PICKUP" ? "Recogida" : "Local"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/branches/${branch.id}`}
                    className="inline-flex h-8 items-center rounded-md border border-border bg-transparent px-3 text-xs font-medium text-foreground hover:bg-secondary"
                  >
                    Editar
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`¿Eliminar "${branch.name}"?`)) {
                        deleteMutation.mutate(branch.id);
                      }
                    }}
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
