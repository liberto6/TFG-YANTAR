"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCompanyConfig, useUpdateBranding } from "@/features/admin-company/hooks/use-branding";

const COLOR_FIELDS: { key: string; label: string }[] = [
  { key: "colorPrimary", label: "Color primario" },
  { key: "colorSecondary", label: "Color secundario" },
  { key: "colorAccent", label: "Color de acento" },
  { key: "colorBackground", label: "Fondo" },
  { key: "colorSurface", label: "Superficie (cards)" },
  { key: "colorText", label: "Texto principal" },
  { key: "colorTextMuted", label: "Texto secundario" },
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
    setColors({
      colorPrimary: config.colorPrimary ?? "#000000",
      colorSecondary: config.colorSecondary ?? "#f5f5f5",
      colorAccent: config.colorAccent ?? "#000000",
      colorBackground: config.colorBackground ?? "#ffffff",
      colorSurface: config.colorSurface ?? "#f9f9f9",
      colorText: config.colorText ?? "#111111",
      colorTextMuted: config.colorTextMuted ?? "#888888",
    });
  }, [config]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Branding</h2>
        <p className="text-sm text-muted-foreground">Personaliza la apariencia de tu web de pedidos</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-medium">Identidad</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre de la app</label>
              <Input
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder={config?.name ?? "Mi Restaurante"}
              />
              <p className="text-xs text-muted-foreground">Aparece en el título de la web y el header</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">URL del logo</label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            {logoUrl && (
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground">Preview:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo preview" className="h-10 object-contain" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">Mensaje de bienvenida</label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Bienvenido a nuestro restaurante..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-medium">Paleta de colores</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <label className="w-40 text-sm font-medium">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[key] ?? "#000000"}
                    onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <Input
                    value={colors[key] ?? ""}
                    onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-28 font-mono text-xs"
                    placeholder="#000000"
                  />
                </div>
                <div
                  className="h-6 w-12 rounded border border-border"
                  style={{ backgroundColor: colors[key] }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-medium">Vista previa del header</h3>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.colorBackground ?? "#ffffff" }}
            >
              <div
                className="flex h-14 items-center justify-between rounded-md px-4"
                style={{ backgroundColor: colors.colorSurface ?? "#f9f9f9" }}
              >
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="logo" className="h-8 object-contain" />
                  )}
                  <span
                    className="font-bold"
                    style={{ color: colors.colorText ?? "#111111" }}
                  >
                    {appName || config?.name || "Mi Restaurante"}
                  </span>
                </div>
                <div
                  className="rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: colors.colorPrimary ?? "#000000" }}
                >
                  Carrito
                </div>
              </div>
              {welcomeMessage && (
                <p
                  className="mt-2 text-sm"
                  style={{ color: colors.colorTextMuted ?? "#888888" }}
                >
                  {welcomeMessage}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Guardando..." : "Guardar branding"}
          </Button>
          {saved && <span className="text-sm text-green-600">Cambios guardados</span>}
        </div>
      </form>
    </div>
  );
}
