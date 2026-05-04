"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { DishDetailContent } from "./DishDetailContent";

interface DishSheetContextValue {
  openDish: (dishId: string) => void;
  close: () => void;
}

const DishSheetContext = createContext<DishSheetContextValue | null>(null);

/**
 * Provider que monta un BottomSheet con el detalle de plato. Cualquier
 * componente bajo este provider puede llamar `useDishSheet().openDish(id)`
 * para abrir el detalle sin navegar de ruta.
 *
 * La página `/dish/[id]` sigue funcionando como fallback (URL directa /
 * deep-linking).
 */
export function DishSheetProvider({ children }: { children: ReactNode }) {
  const [activeDishId, setActiveDishId] = useState<string | null>(null);

  const openDish = useCallback((id: string) => setActiveDishId(id), []);
  const close = useCallback(() => setActiveDishId(null), []);

  return (
    <DishSheetContext.Provider value={{ openDish, close }}>
      {children}
      <BottomSheet open={activeDishId !== null} onClose={close}>
        {activeDishId && (
          <DishDetailContent dishId={activeDishId} onAdded={close} />
        )}
      </BottomSheet>
    </DishSheetContext.Provider>
  );
}

/**
 * Devuelve `{ openDish, close }` o null si no hay provider montado. Permite
 * que un componente reaccione condicionalmente: si hay sheet disponible lo
 * abre, si no, navega a la URL directa.
 */
export function useDishSheet(): DishSheetContextValue | null {
  return useContext(DishSheetContext);
}
