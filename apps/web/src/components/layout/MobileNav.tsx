"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu as MenuIcon,
  X,
  UtensilsCrossed,
  ClipboardList,
  User as UserIcon,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/cn";

interface NavLink {
  href: string;
  label: string;
  Icon: typeof MenuIcon;
}

const PUBLIC_LINKS: NavLink[] = [
  { href: "/menu", label: "Carta", Icon: UtensilsCrossed },
  { href: "/orders", label: "Mis pedidos", Icon: ClipboardList },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-primary-foreground transition-colors hover:bg-white/10 md:hidden"
      >
        <MenuIcon size={20} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 animate-fade-in bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] animate-slide-in-right flex-col bg-background shadow-xl md:hidden"
            style={{ animationDirection: "reverse" }}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-h3">Menú</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              {PUBLIC_LINKS.map(({ href, label, Icon }) => {
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors",
                    pathname?.startsWith("/profile")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  <UserIcon size={18} />
                  Mi perfil
                </Link>
              )}
            </nav>

            <div className="border-t border-border p-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {user && (
                    <div className="px-3 py-1 text-caption text-muted-foreground">
                      {user.email}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <LogOut size={18} />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  <LogIn size={18} />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
