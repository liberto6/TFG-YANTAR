"use client";

import { useParams } from "next/navigation";
import { useAdminBranches } from "@/features/admin-company/hooks/use-admin-branches";
import { BranchForm } from "@/features/admin-company/components/BranchForm";
import { HoursEditor } from "@/features/admin-company/components/HoursEditor";

export default function EditBranchPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const { data: branches, isLoading } = useAdminBranches();
  const branch = branches?.find((b) => b.id === branchId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!branch) {
    return <p className="text-muted-foreground">Sede no encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Editar sede</h2>
        <p className="text-sm text-muted-foreground">{branch.name}</p>
      </div>
      <BranchForm branch={branch} />
      <HoursEditor branchId={branchId} />
    </div>
  );
}
