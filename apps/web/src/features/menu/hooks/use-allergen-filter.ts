"use client";

import { useState, useCallback } from "react";

const EU_ALLERGENS = [
  { code: "GLUTEN", label: "Gluten" },
  { code: "CRUSTACEANS", label: "Crustaceos" },
  { code: "EGGS", label: "Huevo" },
  { code: "FISH", label: "Pescado" },
  { code: "PEANUTS", label: "Cacahuetes" },
  { code: "SOY", label: "Soja" },
  { code: "DAIRY", label: "Lacteos" },
  { code: "NUTS", label: "Frutos secos" },
  { code: "CELERY", label: "Apio" },
  { code: "MUSTARD", label: "Mostaza" },
  { code: "SESAME", label: "Sesamo" },
  { code: "SULPHITES", label: "Sulfitos" },
  { code: "LUPIN", label: "Altramuces" },
  { code: "MOLLUSCS", label: "Moluscos" },
] as const;

export type AllergenCode = (typeof EU_ALLERGENS)[number]["code"];

export function useAllergenFilter() {
  const [excluded, setExcluded] = useState<Set<AllergenCode>>(new Set());

  const toggle = useCallback((code: AllergenCode) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setExcluded(new Set()), []);

  return {
    excluded,
    excludedList: Array.from(excluded),
    toggle,
    clear,
    allergens: EU_ALLERGENS,
  };
}
