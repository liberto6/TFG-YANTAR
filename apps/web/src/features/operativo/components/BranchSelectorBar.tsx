"use client";

import { useSelectedBranch } from "../hooks/use-selected-branch";

/**
 * Shows a branch picker when multiple branches exist.
 * Invisible in single-branch setups — no friction for the common case.
 */
export function BranchSelectorBar() {
  const { selectedBranchId, selectedBranch, setSelectedBranchId, branches, isLoading } =
    useSelectedBranch();

  if (isLoading) {
    return <div className="h-9 w-48 animate-pulse rounded-lg bg-muted" />;
  }

  // Single branch — just show its name, no interaction needed
  if (branches.length <= 1) {
    return selectedBranch ? (
      <span className="text-sm font-medium text-muted-foreground">
        {selectedBranch.name}
      </span>
    ) : null;
  }

  // Multiple branches — show a select dropdown
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sede:</span>
      <select
        value={selectedBranchId ?? ""}
        onChange={(e) => setSelectedBranchId(e.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
