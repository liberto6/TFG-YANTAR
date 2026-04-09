import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

const COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG!;

export interface BranchSummary {
  id: string;
  name: string;
  address: string;
  serviceModes: string[];
}

export function useBranches() {
  return useQuery<BranchSummary[]>({
    queryKey: ["branches", COMPANY_SLUG],
    queryFn: () => api.get<BranchSummary[]>(`/companies/${COMPANY_SLUG}/branches`),
    staleTime: 10 * 60 * 1000,
  });
}
