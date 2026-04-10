import Link from "next/link";
import type { ReactNode } from "react";
import { CartBadge } from "@/features/cart/components/CartBadge";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { PointsBadge } from "@/features/loyalty/components/PointsBadge";
import { buildBrandingCssVars } from "@/lib/color-utils";

interface CompanyConfig {
  name: string;
  appName?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  colorAccent?: string | null;
  colorBackground?: string | null;
  colorSurface?: string | null;
  colorText?: string | null;
  colorTextMuted?: string | null;
}

async function fetchCompanyConfig(): Promise<CompanyConfig | null> {
  const slug = process.env.NEXT_PUBLIC_COMPANY_SLUG;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!slug || !apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/companies/${slug}/config`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const config = await fetchCompanyConfig();
  const brandingVars = config ? buildBrandingCssVars(config) : "";
  const restaurantName =
    config?.appName ?? config?.name ?? process.env.NEXT_PUBLIC_COMPANY_SLUG ?? "Restaurante";

  return (
    <div className="flex min-h-screen flex-col">
      {brandingVars && <style>{`:root { ${brandingVars} }`}</style>}

      <header className="sticky top-0 z-50 border-b border-border bg-primary text-white">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/menu" className="text-lg font-bold tracking-tight">
            {restaurantName}
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/menu"
              className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-white/10"
            >
              Carta
            </Link>
            <Link
              href="/orders"
              className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-white/10"
            >
              Pedidos
            </Link>
            <PointsBadge />
            <CartBadge />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {children}
      </main>

      <CartDrawer />

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Powered by Yantar
      </footer>
    </div>
  );
}
