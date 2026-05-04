"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Building2,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Heart,
  LayoutGrid,
  LogOut,
  Menu as MenuIcon,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CommandPalette } from "@/features/admin-shell/components/CommandPalette";
import { cn } from "@/lib/cn";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "Dashboard", Icon: LayoutGrid },
  { href: "/admin/menu", label: "Carta", Icon: UtensilsCrossed },
  { href: "/admin/branches", label: "Sedes", Icon: Building2 },
  { href: "/admin/orders", label: "Pedidos", Icon: ClipboardList },
  { href: "/admin/loyalty", label: "Fidelización", Icon: Heart },
  { href: "/admin/settings", label: "Configuración", Icon: Settings },
];

const COLLAPSED_KEY = "yantar_admin_sidebar_collapsed";

function pageTitle(pathname: string): string {
  const match = sidebarLinks.find((l) => pathname.startsWith(l.href));
  return match?.label ?? "Panel de Administración";
}

interface SidebarBodyProps {
  pathname: string;
  user: { displayName?: string | null; email?: string | null } | null;
  onLogout: () => void;
  onLinkClick?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

function SidebarBody({
  pathname,
  user,
  onLogout,
  onLinkClick,
  collapsed = false,
  onToggleCollapsed,
}: SidebarBodyProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-3">
        <Link
          href="/admin/dashboard"
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-2 text-h3 font-bold text-primary transition-opacity",
            collapsed && "px-2",
          )}
          title="Yantar Admin"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            Y
          </span>
          {!collapsed && <span className="truncate">Yantar Admin</span>}
        </Link>
        {onToggleCollapsed && !collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Colapsar sidebar (atajo: [)"
            title="Colapsar [ ]"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:inline-flex"
          >
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>
      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3",
        )}
        aria-label="Sidebar"
      >
        {sidebarLinks.map(({ href, label, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md py-2.5 text-body-sm font-medium transition-colors",
                collapsed ? "justify-center px-2" : "px-3",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          );
        })}
        {onToggleCollapsed && collapsed && (
          <button
            onClick={onToggleCollapsed}
            aria-label="Expandir sidebar (atajo: [)"
            title="Expandir [ ]"
            className="hidden h-9 w-full items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:inline-flex"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </nav>
      <div
        className={cn(
          "space-y-2 border-t border-border p-3",
          collapsed && "px-2",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-md py-2",
            collapsed ? "justify-center px-1" : "px-3",
          )}
          title={collapsed ? `${user?.displayName ?? "Admin"}\n${user?.email ?? ""}` : undefined}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-body-sm font-medium text-primary-foreground">
            {user?.displayName?.[0]?.toUpperCase() ?? "A"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-medium text-foreground">
                {user?.displayName ?? "Admin"}
              </p>
              <p className="truncate text-caption text-muted-foreground">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          title={collapsed ? "Cerrar sesión" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-md py-2 text-body-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            collapsed ? "justify-center px-2" : "px-3",
          )}
        >
          <LogOut size={16} />
          {!collapsed && "Cerrar sesión"}
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
  const [collapsed, setCollapsed] = useState(false);

  // Hidrata el estado collapsed desde localStorage. Hacerlo en effect (no en
  // useState init) evita mismatch de hidratación SSR.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? "true" : "false");
    } catch {}
  }, [collapsed]);

  // Atajo de teclado: [ y ] para colapsar/expandir.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (e.key === "[" || e.key === "]") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-surface transition-[width] duration-200 ease-out-expo lg:block",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <SidebarBody
          pathname={pathname}
          user={user ?? null}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
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

          {/* Search-as-button que dispara el command palette. Decorativo:
              el atajo real es Ctrl/Cmd+K, pero esto lo hace descubrible. */}
          <button
            onClick={() => {
              // Disparamos el mismo evento que captura el command palette.
              const isMac = navigator.platform.toLowerCase().includes("mac");
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: isMac,
                  ctrlKey: !isMac,
                  bubbles: true,
                }),
              );
            }}
            className="ml-auto hidden h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-body-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
            aria-label="Abrir paleta de comandos (Ctrl+K)"
          >
            <span>Buscar acciones…</span>
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}
