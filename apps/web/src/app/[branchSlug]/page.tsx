import { notFound } from "next/navigation";
import { LandingPage } from "@/features/branch/components/LandingPage";
import { brandingStyleTag, fetchCompanyConfig } from "@/lib/company-config";
import { getTenantSlug } from "@/lib/tenant";

/**
 * Entrada directa a una sede concreta: `<empresa>.yantar.app/<branchSlug>`.
 *
 * Resuelve la sede por slug en SSR; si existe, abre la landing con la sede
 * pre-seleccionada (paso "elegir modalidad"). Si no, devuelve 404 — para que
 * Next.js distinga rutas estáticas (/menu, /orders, ...) de slugs de sede,
 * confiamos en su prioridad nativa: las rutas estáticas siempre ganan.
 */

interface BranchSummary {
  id: string;
  slug: string;
  name: string;
  address: string;
  serviceModes: string[];
}

async function fetchBranch(
  companySlug: string,
  branchSlug: string,
): Promise<BranchSummary | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const res = await fetch(
      `${apiUrl}/companies/${companySlug}/branches/by-slug/${branchSlug}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function BranchEntryPage({
  params,
}: {
  params: { branchSlug: string };
}) {
  const tenantSlug = getTenantSlug();
  if (!tenantSlug) notFound();

  const branch = await fetchBranch(tenantSlug, params.branchSlug);
  if (!branch) notFound();

  const config = await fetchCompanyConfig(tenantSlug);
  const styleTag = brandingStyleTag(config);

  return (
    <>
      {styleTag && <style>{styleTag}</style>}
      <LandingPage
        franchiseName={config?.appName ?? config?.name ?? "Nuestros Restaurantes"}
        logoUrl={config?.logoUrl ?? null}
        welcomeMessage={config?.welcomeMessage ?? null}
        initialBranch={branch}
      />
    </>
  );
}
