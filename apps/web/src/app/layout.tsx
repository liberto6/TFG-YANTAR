import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/lib/query-provider";
import { ConfirmProvider } from "@/lib/confirm-provider";
import { ToastProvider } from "@/lib/toast-provider";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { CartProvider } from "@/features/cart/context/cart-context";
import { BranchProvider } from "@/features/branch/context/branch-context";
import { TenantProvider } from "@/features/tenant/context/tenant-context";
import { getTenantSlug } from "@/lib/tenant";
import "./globals.css";

// Inter es la fuente de referencia 2024-2025 en B2B SaaS (GitHub, Notion,
// Linear). El opcional `optical sizing` ajusta la rasterización a tamaños
// grandes; en headers de display (`text-display`) lo combinamos con
// `tracking-tight` desde el config de Tailwind.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
    <html lang="es" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {tenantSlug ? (
          <TenantProvider slug={tenantSlug}>{inner}</TenantProvider>
        ) : (
          inner
        )}
      </body>
    </html>
  );
}
