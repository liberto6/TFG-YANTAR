import { buildBrandingCssVars } from "@/lib/color-utils";

export interface CompanyConfig {
  id?: string;
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

export async function fetchCompanyConfig(
  slug: string | null,
): Promise<CompanyConfig | null> {
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

export function brandingStyleTag(config: CompanyConfig | null): string {
  if (!config) return "";
  const vars = buildBrandingCssVars(config);
  return vars ? `:root { ${vars} }` : "";
}
