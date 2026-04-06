"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { randomUUID } from "@/lib/uuid";
import type { CartItem, CartItemModifier } from "../types/cart.types";

// --- State ---

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// --- Actions ---

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "cartItemId"> }
  | { type: "REMOVE_ITEM"; cartItemId: string }
  | { type: "UPDATE_QUANTITY"; cartItemId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "OPEN_DRAWER" }
  | { type: "CLOSE_DRAWER" }
  | { type: "HYDRATE"; items: CartItem[] };

// --- Reducer ---

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items };

    case "ADD_ITEM": {
      // Try to find an existing identical item (same dish + variant + modifiers + notes)
      const existing = state.items.find(
        (item) =>
          item.dishId === action.payload.dishId &&
          item.selectedVariantOptionId ===
            action.payload.selectedVariantOptionId &&
          JSON.stringify(
            [...action.payload.selectedModifierOptionIds].sort(),
          ) ===
            JSON.stringify(
              [...item.selectedModifierOptionIds].sort(),
            ) &&
          item.notes === action.payload.notes,
      );

      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.cartItemId === existing.cartItemId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item,
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          { ...action.payload, cartItemId: randomUUID() },
        ],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) => item.cartItemId !== action.cartItemId,
        ),
      };

    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => item.cartItemId !== action.cartItemId,
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.cartItemId === action.cartItemId
            ? { ...item, quantity: action.quantity }
            : item,
        ),
      };

    case "CLEAR":
      return { ...state, items: [] };

    case "OPEN_DRAWER":
      return { ...state, isOpen: true };

    case "CLOSE_DRAWER":
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

// --- Context ---

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "cartItemId">) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "yantar_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const items = JSON.parse(raw) as CartItem[];
        dispatch({ type: "HYDRATE", items });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "cartItemId">) =>
      dispatch({ type: "ADD_ITEM", payload: item }),
    [],
  );
  const removeItem = useCallback(
    (cartItemId: string) => dispatch({ type: "REMOVE_ITEM", cartItemId }),
    [],
  );
  const updateQuantity = useCallback(
    (cartItemId: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", cartItemId, quantity }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openDrawer = useCallback(() => dispatch({ type: "OPEN_DRAWER" }), []);
  const closeDrawer = useCallback(
    () => dispatch({ type: "CLOSE_DRAWER" }),
    [],
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used inside CartProvider");
  return ctx;
}
