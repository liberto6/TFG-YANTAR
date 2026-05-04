"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ClipboardList,
  Heart,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  Icon: LucideIcon;
  onRun: () => void;
  group: "Navegar" | "Crear" | "Acciones";
}

/**
 * Command palette del admin (estilo Linear/Vercel/Notion).
 *
 * Se abre con Ctrl/Cmd+K. Lista de comandos hardcodeada por ahora — en una
 * próxima iteración se enriquecerá con resultados dinámicos (sedes, platos,
 * pedidos) usando las queries de React Query ya cacheadas.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Atajo global Ctrl/Cmd+K para abrir.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdK =
        (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (cmdK) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset al abrir.
  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlight(0);
      // Focus al input tras paint.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const allCommands: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        label: "Ir al Dashboard",
        Icon: LayoutGrid,
        group: "Navegar",
        onRun: () => router.push("/admin/dashboard"),
      },
      {
        id: "nav-menu",
        label: "Ir a Carta",
        Icon: UtensilsCrossed,
        group: "Navegar",
        onRun: () => router.push("/admin/menu"),
      },
      {
        id: "nav-branches",
        label: "Ir a Sedes",
        Icon: Building2,
        group: "Navegar",
        onRun: () => router.push("/admin/branches"),
      },
      {
        id: "nav-orders",
        label: "Ir a Pedidos",
        Icon: ClipboardList,
        group: "Navegar",
        onRun: () => router.push("/admin/orders"),
      },
      {
        id: "nav-loyalty",
        label: "Ir a Fidelización",
        Icon: Heart,
        group: "Navegar",
        onRun: () => router.push("/admin/loyalty"),
      },
      {
        id: "nav-settings",
        label: "Ir a Configuración",
        Icon: Settings,
        group: "Navegar",
        onRun: () => router.push("/admin/settings"),
      },
      {
        id: "create-dish",
        label: "Crear plato",
        hint: "Carta",
        Icon: Plus,
        group: "Crear",
        onRun: () => router.push("/admin/menu/new"),
      },
      {
        id: "create-branch",
        label: "Crear sede",
        hint: "Sucursales",
        Icon: Plus,
        group: "Crear",
        onRun: () => router.push("/admin/branches/new"),
      },
      {
        id: "create-reward",
        label: "Crear recompensa",
        hint: "Fidelización",
        Icon: Plus,
        group: "Crear",
        onRun: () => router.push("/admin/loyalty/rewards/new"),
      },
      {
        id: "action-branding",
        label: "Editar branding",
        Icon: Settings,
        group: "Acciones",
        onRun: () => router.push("/admin/settings/branding"),
      },
    ],
    [router],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    );
  }, [allCommands, query]);

  // Resetea highlight al cambiar query.
  useEffect(() => {
    setHighlight(0);
  }, [query]);

  function runHighlighted() {
    const cmd = filtered[highlight];
    if (!cmd) return;
    cmd.onRun();
    setOpen(false);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runHighlighted();
    }
  }

  if (!open) return null;

  // Agrupa comandos visibles por su `group`.
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
      <div
        className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="absolute left-1/2 top-[15vh] w-[92vw] max-w-xl -translate-x-1/2 animate-fade-in-up overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search size={16} className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Buscar acciones, secciones…"
            className="h-12 flex-1 bg-transparent text-body text-foreground placeholder:text-muted-foreground focus:outline-none"
            aria-label="Buscar acción"
          />
          <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-body-sm text-muted-foreground">
              Sin resultados.
            </p>
          )}
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="mb-2 last:mb-0">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {groupName}
              </p>
              <ul>
                {items.map((cmd) => {
                  const idx = filtered.indexOf(cmd);
                  const active = idx === highlight;
                  const Icon = cmd.Icon;
                  return (
                    <li key={cmd.id}>
                      <button
                        onMouseEnter={() => setHighlight(idx)}
                        onClick={() => {
                          cmd.onRun();
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-body-sm transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-secondary",
                        )}
                      >
                        <Icon size={15} className={active ? "" : "text-muted-foreground"} />
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {cmd.hint && (
                          <span
                            className={cn(
                              "text-caption",
                              active ? "opacity-80" : "text-muted-foreground",
                            )}
                          >
                            {cmd.hint}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-3 py-2 text-caption text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd> abrir
            </span>
          </div>
          <span className="hidden sm:inline">
            <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> para abrir
          </span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px] text-foreground">
      {children}
    </kbd>
  );
}
