import { LandingPage } from "@/features/branch/components/LandingPage";
import { buildBrandingCssVars } from "@/lib/color-utils";

interface CompanyConfig {
  id: string;
  name: string;
  appName?: string | null;
  logoUrl?: string | null;
  welcomeMessage?: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  colorAccent?: string | null;
  colorBackground?: string | null;
  colorSurface?: string | null;
  colorText?: string | null;
  colorTextMuted?: string | null;
}

async function fetchConfig(): Promise<CompanyConfig | null> {
  const slug = process.env.NEXT_PUBLIC_COMPANY_SLUG;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!slug || !apiUrl) return null;
  try {
    const res = await fetch(`${apiUrl}/companies/${slug}/config`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const config = await fetchConfig();
  const cssVars = config ? buildBrandingCssVars(config) : {};
  const cssString = Object.entries(cssVars)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");

  return (
    <>
      {cssString && <style>{`:root { ${cssString} }`}</style>}
      <LandingPage
        franchiseName={config?.appName ?? config?.name ?? "Nuestros Restaurantes"}
        logoUrl={config?.logoUrl ?? null}
        welcomeMessage={config?.welcomeMessage ?? null}
      />
    </>
  );
}
