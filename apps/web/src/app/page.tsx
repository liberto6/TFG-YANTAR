import { LandingPage } from "@/features/branch/components/LandingPage";
import { brandingStyleTag, fetchCompanyConfig } from "@/lib/company-config";
import { getTenantSlug } from "@/lib/tenant";
import { SaaSLanding } from "@/features/saas/components/SaaSLanding";

export default async function HomePage() {
  const tenantSlug = getTenantSlug();

  // Sin slug: estamos en la landing pública del SaaS (yantar.app raíz).
  if (!tenantSlug) {
    return <SaaSLanding />;
  }

  const config = await fetchCompanyConfig(tenantSlug);
  const styleTag = brandingStyleTag(config);

  return (
    <>
      {styleTag && <style>{styleTag}</style>}
      <LandingPage
        franchiseName={config?.appName ?? config?.name ?? "Nuestros Restaurantes"}
        logoUrl={config?.logoUrl ?? null}
        welcomeMessage={config?.welcomeMessage ?? null}
      />
    </>
  );
}
