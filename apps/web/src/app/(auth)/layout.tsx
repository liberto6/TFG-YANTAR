import Image from "next/image";
import type { ReactNode } from "react";
import { brandingStyleTag, fetchCompanyConfig } from "@/lib/company-config";
import { getTenantSlug } from "@/lib/tenant";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const tenantSlug = getTenantSlug();
  const config = await fetchCompanyConfig(tenantSlug);
  const styleTag = brandingStyleTag(config);
  const restaurantName = config?.appName ?? config?.name ?? "Yantar";
  const welcomeMessage =
    config?.welcomeMessage ??
    "Tu restaurante de confianza, listo para llevar a tu mesa o a tu casa.";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {styleTag && <style>{styleTag}</style>}

      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-accent blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          {config?.logoUrl ? (
            <Image
              src={config.logoUrl}
              alt={restaurantName}
              width={48}
              height={48}
              className="rounded-lg bg-white/10 object-contain p-1"
            />
          ) : null}
          <span className="text-h3 font-bold">{restaurantName}</span>
        </div>

        <div className="relative max-w-md space-y-4">
          <h2 className="text-display">{welcomeMessage}</h2>
          <p className="text-body opacity-80">
            Pide en segundos, sigue tu pedido en tiempo real y gana puntos en cada compra.
          </p>
        </div>

        <p className="relative text-caption opacity-70">Powered by Yantar</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
        {children}
      </main>
    </div>
  );
}
