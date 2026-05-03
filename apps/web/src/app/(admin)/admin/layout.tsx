"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Building2,
  ClipboardList,
  Heart,
  LayoutGrid,
  LogOut,
  Menu as MenuIcon,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/cn";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { href: "/admin/menu", label: "Carta", Icon: UtensilsCrossed },
  { href: "/admin/branches", label: "Sedes", Icon: Building2 },
  { href: "/admin/orders", label: "Pedidos", Icon: ClipboardList },
  { href: "/admin/loyalty", label: "Fidelización", Icon: Heart },
  { href: "/admin/settings", label: "Configuración", Icon: Settings },
];

function pageTitle(pathname: string): string {
  const match = sidebarLinks.find((l) => pathname.startsWith(l.href));
  return match?.label ?? "Panel de Administración";
}

interface SidebarBodyProps {
  pathname: string;
  user: { displayName?: string | null; email?: string | null } | null;
  onLogout: () => void;
  onLinkClick?: () => void;
}

function SidebarBody({ pathname, user, onLogout, onLinkClick }: SidebarBodyProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link
          href="/admin/dashboard"
          onClick={onLinkClick}
          className="text-h3 font-bold text-primary"
        >
          Yantar Admin
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
        {sidebarLinks.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-body-sm font-medium text-primary-foreground">
            {user?.displayName?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-foreground">
              {user?.displayName ?? "Admin"}
            </p>
            <p className="truncate text-caption text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role === "CUSTOMER")) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Spinner size={18} />
        <span className="text-body-sm">Cargando…</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
        <SidebarBody pathname={pathname} user={user ?? null} onLogout={handleLogout} />
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 animate-fade-in bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] animate-slide-in-right border-r border-border bg-surface lg:hidden"
            style={{ animationDirection: "reverse" }}
            role="dialog"
            aria-modal="true"
            aria-label="Menú lateral"
          >
            <SidebarBody
              pathname={pathname}
              user={user ?? null}
              onLogout={handleLogout}
              onLinkClick={() => setMobileOpen(false)}
            />
          </aside>
        </>
      )}

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <MenuIcon size={20} />
          </button>
          <h1 className="text-h3 text-foreground">{pageTitle(pathname)}</h1>
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
