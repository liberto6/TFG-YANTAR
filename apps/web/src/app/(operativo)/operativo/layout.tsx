"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Clock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/hooks/use-auth";

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null;
  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-body-sm font-medium tabular-nums text-foreground">
      <Clock size={14} className="text-muted-foreground" />
      {time}
    </span>
  );
}

export default function OperativoLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role === "CUSTOMER")) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Spinner size={18} />
        <span className="text-body-sm">Cargando…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ChefHat size={16} />
          </span>
          <h1 className="truncate text-h3 text-foreground">Vista operativa</h1>
        </div>
        <div className="flex items-center gap-2">
          <LiveClock />
          {user && (
            <span className="hidden text-caption text-muted-foreground sm:inline">
              {user.displayName}
            </span>
          )}
        </div>
      </header>
      <main id="main-content" className="p-4">{children}</main>
    </div>
  );
}
