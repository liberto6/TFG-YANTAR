"use client";

import { useState, useEffect } from "react";
import { useAdminBranches } from "@/features/admin-company/hooks/use-admin-branches";

const STORAGE_KEY = "yantar_admin_selected_branch";

/**
 * Manages the active branch for the operativo and admin order views.
 * Auto-selects when only one branch exists; persists choice in localStorage.
 */
export function useSelectedBranch() {
  const { data: branches, isLoading } = useAdminBranches();
  const [selectedBranchId, setSelectedBranchIdRaw] = useState<string | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSelectedBranchIdRaw(stored);
  }, []);

  // Auto-select when branches load
  useEffect(() => {
    if (!branches || branches.length === 0) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    // If stored value is still a valid branch, keep it
    if (stored && branches.some((b) => b.id === stored)) return;
    // Otherwise auto-select first (only one branch → transparent for single-branch setups)
    setSelectedBranchIdRaw(branches[0].id);
    localStorage.setItem(STORAGE_KEY, branches[0].id);
  }, [branches]);

  function setSelectedBranchId(id: string) {
    setSelectedBranchIdRaw(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  const selectedBranch = branches?.find((b) => b.id === selectedBranchId) ?? null;

  return {
    selectedBranchId,
    selectedBranch,
    setSelectedBranchId,
    branches: branches ?? [],
    isLoading,
  };
}
