"use client";

import { BranchForm } from "@/features/admin-company/components/BranchForm";

export default function NewBranchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Nueva sede</h2>
        <p className="text-sm text-muted-foreground">Añade una nueva ubicación a tu restaurante</p>
      </div>
      <BranchForm />
    </div>
  );
}
