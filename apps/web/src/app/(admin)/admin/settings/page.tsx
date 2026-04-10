"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useCompanyConfig } from "@/features/admin-company/hooks/use-branding";

export default function SettingsPage() {
  const { data: config, isLoading } = useCompanyConfig();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
        <p className="text-sm text-muted-foreground">Ajustes generales de tu restaurante</p>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Datos del restaurante</p>
                <p className="text-sm text-muted-foreground">
                  {config?.name} · {config?.slug}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">Solo editable desde registro</span>
            </div>
          </CardContent>
        </Card>

        <Link href="/admin/settings/branding">
          <Card className="cursor-pointer transition-colors hover:bg-secondary/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Branding</p>
                  <p className="text-sm text-muted-foreground">
                    Logo, colores y textos de tu web de pedidos
                  </p>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/branches">
          <Card className="cursor-pointer transition-colors hover:bg-secondary/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Sedes y horarios</p>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tus ubicaciones y horarios de apertura
                  </p>
                </div>
                <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
