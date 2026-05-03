"use client";

import { Image as ImageIcon, Palette } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { useTyping } from "../hooks/use-typing";
import { AdminSidebar } from "./04-admin-empty";
import { DEMO_COMPANY } from "../data/napoli-fixtures";

/**
 * Paso 5 — Ana configura su marca. Edita appName y mensaje de bienvenida con
 * typing animado, y elige paleta. La columna derecha previsualiza en vivo el
 * cambio sobre un mini-card de la app del comensal.
 */
export function Step05Branding() {
  const appName = useTyping(DEMO_COMPANY.appName, { startDelay: 400, speed: 60 });
  const welcome = useTyping(DEMO_COMPANY.welcomeMessage, {
    startDelay: appName.totalMs + 400,
    speed: 35,
  });

  return (
    <DemoChapter url="napoli.yantar.app/admin/settings/branding">
      <div className="flex">
        <AdminSidebar active="settings" />
        <div className="flex-1 grid gap-5 p-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <h1 className="text-h2 text-foreground">Marca</h1>
              <p className="text-body-sm text-muted-foreground">
                Personaliza la imagen que verán tus comensales.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground">Logotipo</label>
              <div className="flex h-20 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/40 text-muted-foreground">
                <ImageIcon size={18} />
                <span className="text-body-sm">Subir imagen</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground">
                Nombre de la app
              </label>
              <div className="flex h-9 items-center rounded-md border border-border bg-background px-3 text-body-sm">
                <span className="text-foreground">{appName.text}</span>
                {!appName.done && (
                  <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-caption text-muted-foreground">
                Mensaje de bienvenida
              </label>
              <div className="flex min-h-[60px] items-start rounded-md border border-border bg-background px-3 py-2 text-body-sm">
                <span className="text-foreground">{welcome.text}</span>
                {appName.done && !welcome.done && (
                  <span className="ml-0.5 mt-0.5 inline-block h-4 w-[2px] animate-pulse bg-primary" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-caption text-muted-foreground">
                <Palette size={12} /> Paleta
              </label>
              <div className="flex gap-1.5">
                <ColorChip color="#c0392b" label="Primario" />
                <ColorChip color="#f5f5f5" label="Secundario" />
                <ColorChip color="#e67e22" label="Acento" />
                <ColorChip color="#ffffff" label="Fondo" />
                <ColorChip color="#fafafa" label="Surface" />
                <ColorChip color="#1a1a1a" label="Texto" />
                <ColorChip color="#777777" label="Muted" />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              Vista previa en vivo
            </p>
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <div
                className="flex items-center justify-between px-3 py-2 text-white"
                style={{ background: "#c0392b" }}
              >
                <span className="text-body-sm font-semibold">{appName.text || "—"}</span>
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                  Sede Centro
                </span>
              </div>
              <div className="space-y-2 p-3">
                <p className="text-caption text-muted-foreground">
                  {welcome.text || "—"}
                </p>
                <div className="flex items-center gap-2 rounded-md border border-border p-2">
                  <div
                    className="h-9 w-9 rounded-md"
                    style={{ background: "linear-gradient(135deg,#c0392b22,#e67e2244)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-medium text-foreground">Margherita</p>
                    <p className="text-caption text-muted-foreground">
                      Tomate, mozzarella, albahaca
                    </p>
                  </div>
                  <span className="text-body-sm font-semibold">10,50 €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoChapter>
  );
}

function ColorChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="block h-7 w-7 rounded-md border border-border"
        style={{ background: color }}
        aria-label={label}
      />
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
  );
}
