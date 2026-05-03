"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Check, ImageIcon, Palette, RotateCcw, ShoppingBag } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCompanyConfig,
  useUpdateBranding,
} from "@/features/admin-company/hooks/use-branding";

interface ColorField {
  key: string;
  label: string;
  hint: string;
  defaultValue: string;
}

const COLOR_FIELDS: ColorField[] = [
  { key: "colorPrimary", label: "Primario", hint: "Botones, headers, acentos principales", defaultValue: "#1e40af" },
  { key: "colorSecondary", label: "Secundario", hint: "Fondos suaves, hover states", defaultValue: "#f1f5f9" },
  { key: "colorAccent", label: "Acento", hint: "CTAs destacados, badges", defaultValue: "#ff8c42" },
  { key: "colorBackground", label: "Fondo", hint: "Color base de la página", defaultValue: "#ffffff" },
  { key: "colorSurface", label: "Superficie", hint: "Tarjetas y bloques", defaultValue: "#fafafa" },
  { key: "colorText", label: "Texto principal", hint: "Títulos y cuerpo", defaultValue: "#0f172a" },
  { key: "colorTextMuted", label: "Texto secundario", hint: "Descripciones y captions", defaultValue: "#64748b" },
];

export default function BrandingPage() {
  const { data: config, isLoading } = useCompanyConfig();
  const updateMutation = useUpdateBranding();

  const [appName, setAppName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [colors, setColors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    setAppName(config.appName ?? "");
    setWelcomeMessage(config.welcomeMessage ?? "");
    setLogoUrl(config.logoUrl ?? "");
    const initial: Record<string, string> = {};
    COLOR_FIELDS.forEach(({ key, defaultValue }) => {
      initial[key] = (config as any)[key] ?? defaultValue;
    });
    setColors(initial);
  }, [config]);

  function setColor(key: string, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }));
  }

  function resetColor(key: string) {
    const field = COLOR_FIELDS.find((f) => f.key === key);
    if (field) setColor(key, field.defaultValue);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync({
        appName: appName || null,
        welcomeMessage: welcomeMessage || null,
        logoUrl: logoUrl || null,
        ...colors,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h1 text-foreground">Branding</h2>
        <p className="text-body-sm text-muted-foreground">
          Personaliza la apariencia de tu web de pedidos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {error && <Alert variant="danger">{error}</Alert>}

          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-h3 text-foreground">Identidad</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="app-name">Nombre de la app</Label>
                <Input
                  id="app-name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder={config?.name ?? "Mi Restaurante"}
                />
                <p className="text-caption text-muted-foreground">
                  Aparece en el título de la web y el header
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="logo-url">URL del logo</Label>
                <Input
                  id="logo-url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://…"
                />
                {logoUrl ? (
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoUrl}
                      alt="Vista previa del logo"
                      className="h-12 w-12 rounded object-contain"
                    />
                    <span className="text-caption text-muted-foreground">Vista previa del logo</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface p-3 text-caption text-muted-foreground">
                    <ImageIcon size={14} /> Aún no hay logo
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="welcome-message">Mensaje de bienvenida</Label>
                <Textarea
                  id="welcome-message"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Bienvenido a nuestro restaurante…"
                  rows={2}
                  maxLength={160}
                  showCount
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-accent" />
                <h3 className="text-h3 text-foreground">Paleta de colores</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {COLOR_FIELDS.map(({ key, label, hint, defaultValue }) => (
                <div
                  key={key}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <Label htmlFor={`color-${key}`} className="mb-0.5">
                      {label}
                    </Label>
                    <p className="text-caption text-muted-foreground">{hint}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-12 overflow-hidden rounded-md border border-border">
                      <input
                        id={`color-${key}`}
                        type="color"
                        value={colors[key] ?? defaultValue}
                        onChange={(e) => setColor(key, e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
                        aria-label={`Selector de color ${label}`}
                      />
                    </div>
                    <Input
                      value={colors[key] ?? ""}
                      onChange={(e) => setColor(key, e.target.value)}
                      className="w-28 font-mono text-caption uppercase"
                      placeholder={defaultValue}
                    />
                    <button
                      type="button"
                      onClick={() => resetColor(key)}
                      aria-label={`Restablecer color ${label}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" loading={updateMutation.isPending}>
              {updateMutation.isPending ? "Guardando…" : "Guardar branding"}
            </Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-body-sm font-medium text-success">
                <Check size={14} /> Cambios guardados
              </span>
            )}
          </div>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <p className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
            Vista previa
          </p>
          <Card className="overflow-hidden">
            <div
              className="space-y-4 p-5"
              style={{ backgroundColor: colors.colorBackground ?? "#ffffff" }}
            >
              <div
                className="flex h-12 items-center justify-between rounded-md px-3"
                style={{ backgroundColor: colors.colorPrimary ?? "#1e40af" }}
              >
                <span className="text-body-sm font-bold text-white truncate">
                  {appName || config?.name || "Mi Restaurante"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-caption font-semibold text-white">
                  <ShoppingBag size={12} /> 3
                </span>
              </div>

              <div
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: colors.colorSurface ?? "#fafafa",
                  borderColor: colors.colorSecondary ?? "#f1f5f9",
                }}
              >
                <p
                  className="text-body-sm font-medium"
                  style={{ color: colors.colorText ?? "#0f172a" }}
                >
                  Pizza margarita
                </p>
                <p
                  className="text-caption"
                  style={{ color: colors.colorTextMuted ?? "#64748b" }}
                >
                  Con tomate, mozzarella y albahaca fresca
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className="text-body-sm font-bold"
                    style={{ color: colors.colorPrimary ?? "#1e40af" }}
                  >
                    9,50 €
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-caption font-semibold text-white"
                    style={{ backgroundColor: colors.colorAccent ?? "#ff8c42" }}
                  >
                    Popular
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full rounded-md py-2 text-body-sm font-medium text-white"
                style={{ backgroundColor: colors.colorPrimary ?? "#1e40af" }}
              >
                Añadir al pedido
              </button>

              {welcomeMessage && (
                <p
                  className="text-caption text-center"
                  style={{ color: colors.colorTextMuted ?? "#64748b" }}
                >
                  {welcomeMessage}
                </p>
              )}
            </div>
          </Card>
          <p className="text-caption text-muted-foreground">
            La paleta se aplica en tiempo real. Pulsa <em>Guardar</em> para hacer
            permanentes los cambios.
          </p>
        </aside>
      </form>
    </div>
  );
}
