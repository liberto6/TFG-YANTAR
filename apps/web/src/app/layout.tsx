import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/lib/query-provider";
import { ConfirmProvider } from "@/lib/confirm-provider";
import { ToastProvider } from "@/lib/toast-provider";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { CartProvider } from "@/features/cart/context/cart-context";
import { BranchProvider } from "@/features/branch/context/branch-context";
import { TenantProvider } from "@/features/tenant/context/tenant-context";
import { getTenantSlug } from "@/lib/tenant";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yantar",
  description: "Plataforma de gestión para restaurantes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1019" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenantSlug = getTenantSlug();

  const inner = (
    <QueryProvider>
      <AuthProvider>
        <BranchProvider>
          <CartProvider>
            <ToastProvider>
              <ConfirmProvider>{children}</ConfirmProvider>
            </ToastProvider>
          </CartProvider>
        </BranchProvider>
      </AuthProvider>
    </QueryProvider>
  );

  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        {tenantSlug ? (
          <TenantProvider slug={tenantSlug}>{inner}</TenantProvider>
        ) : (
          inner
        )}
      </body>
    </html>
  );
}
