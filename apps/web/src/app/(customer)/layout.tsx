import Link from "next/link";
import type { ReactNode } from "react";
import { CartBadge } from "@/features/cart/components/CartBadge";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { CartFloatingBar } from "@/features/cart/components/CartFloatingBar";
import { DishSheetProvider } from "@/features/menu/components/DishSheetProvider";
import { PointsBadge } from "@/features/loyalty/components/PointsBadge";
import { MobileNav } from "@/components/layout/MobileNav";
import { CustomerNavLink } from "@/components/layout/CustomerNavLink";
import { PageTransition } from "@/components/layout/PageTransition";
import { brandingStyleTag, fetchCompanyConfig } from "@/lib/company-config";
import { getTenantSlug } from "@/lib/tenant";

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const tenantSlug = getTenantSlug();
  const config = await fetchCompanyConfig(tenantSlug);
  const styleTag = brandingStyleTag(config);
  const restaurantName =
    config?.appName ?? config?.name ?? tenantSlug ?? "Restaurante";

  return (
    <DishSheetProvider>
      <div className="flex min-h-screen flex-col">
        {styleTag && <style>{styleTag}</style>}

        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>

        <header className="sticky top-0 z-30 border-b border-border bg-primary text-primary-foreground shadow-sm">
          <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-4">
            <MobileNav />

            <Link
              href="/menu"
              className="flex-1 truncate text-h3 font-semibold tracking-tight md:flex-initial"
            >
              {restaurantName}
            </Link>

            <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación">
              <CustomerNavLink href="/menu">Carta</CustomerNavLink>
              <CustomerNavLink href="/orders">Mis pedidos</CustomerNavLink>
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              <PointsBadge />
              <CartBadge />
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          <PageTransition>{children}</PageTransition>
        </main>

        <CartDrawer />
        <CartFloatingBar />

        <footer className="mt-auto border-t border-border py-3 text-center text-caption text-muted-foreground">
          Powered by Yantar
        </footer>
      </div>
    </DishSheetProvider>
  );
}
