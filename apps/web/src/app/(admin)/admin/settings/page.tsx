"use client";

import Link from "next/link";
import {
  Building2,
  ChevronRight,
  Palette,
  Store,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyConfig } from "@/features/admin-company/hooks/use-branding";

interface SettingTileProps {
  href: string;
  Icon: LucideIcon;
  iconClass: string;
  title: string;
  description: string;
}

function SettingTile({ href, Icon, iconClass, title, description }: SettingTileProps) {
  return (
    <Link href={href} className="block">
      <Card className="transition-all hover:border-primary/40 hover:shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <span
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-medium text-foreground">{title}</p>
            <p className="text-body-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SettingsPage() {
  const { data: config, isLoading } = useCompanyConfig();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h1 text-foreground">Configuración</h2>
        <p className="text-body-sm text-muted-foreground">
          Ajustes generales de tu restaurante
        </p>
      </div>

      <div className="grid max-w-2xl gap-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Store size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-foreground">Datos del restaurante</p>
              <p className="truncate text-body-sm text-muted-foreground">
                {config?.name} · /{config?.slug}
              </p>
            </div>
            <span className="hidden text-caption text-muted-foreground sm:block">
              Solo editable desde registro
            </span>
          </CardContent>
        </Card>

        <SettingTile
          href="/admin/settings/branding"
          Icon={Palette}
          iconClass="bg-accent/10 text-accent"
          title="Branding"
          description="Logo, colores y textos de tu web de pedidos"
        />

        <SettingTile
          href="/admin/branches"
          Icon={Building2}
          iconClass="bg-primary/10 text-primary"
          title="Sedes y horarios"
          description="Gestiona tus ubicaciones y horarios de apertura"
        />
      </div>
    </div>
  );
}
