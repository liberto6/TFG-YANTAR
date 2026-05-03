"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useTenantSlug } from "@/features/tenant/context/tenant-context";

export interface BranchSummary {
  id: string;
  slug: string;
  name: string;
  address: string;
  serviceModes: string[];
}

export function useBranches() {
  const companySlug = useTenantSlug();
  return useQuery<BranchSummary[]>({
    queryKey: ["branches", companySlug],
    queryFn: () =>
      api.get<BranchSummary[]>(`/companies/${companySlug}/branches`),
    staleTime: 10 * 60 * 1000,
  });
}
