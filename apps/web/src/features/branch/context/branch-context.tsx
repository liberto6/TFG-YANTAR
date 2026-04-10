"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface SelectedBranch {
  id: string;
  name: string;
  address: string;
  deliveryMode: "PICKUP" | "DELIVERY";
  deliveryFee: number;
  deliveryZoneId?: string;
  /** Customer's delivery address (only set when deliveryMode === "DELIVERY") */
  customerAddress?: string;
}

interface BranchContextValue {
  branch: SelectedBranch | null;
  selectBranch: (branch: SelectedBranch) => void;
  clearBranch: () => void;
}

const BranchContext = createContext<BranchContextValue | null>(null);

const STORAGE_KEY = "yantar_selected_branch";

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branch, setBranch] = useState<SelectedBranch | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBranch(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  function selectBranch(b: SelectedBranch) {
    setBranch(b);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
  }

  function clearBranch() {
    setBranch(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <BranchContext.Provider value={{ branch, selectBranch, clearBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used within BranchProvider");
  return ctx;
}
