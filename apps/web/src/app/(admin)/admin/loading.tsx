import { BrandedLoader } from "@/components/layout/BrandedLoader";
import { fetchCompanyConfig } from "@/lib/company-config";
import { getTenantSlug } from "@/lib/tenant";

export default async function AdminLoading() {
  const config = await fetchCompanyConfig(getTenantSlug());
  return (
    <BrandedLoader
      logoUrl={config?.logoUrl}
      name={config?.appName ?? config?.name ?? "Yantar Admin"}
      message="Cargando panel…"
    />
  );
}
