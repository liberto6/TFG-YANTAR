import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { CartProvider } from "@/features/cart/context/cart-context";
import { BranchProvider } from "@/features/branch/context/branch-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yantar",
  description: "Plataforma de gestion para restaurantes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <QueryProvider>
          <AuthProvider>
            <BranchProvider>
              <CartProvider>{children}</CartProvider>
            </BranchProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
