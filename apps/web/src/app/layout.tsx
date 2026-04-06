import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-provider";
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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
