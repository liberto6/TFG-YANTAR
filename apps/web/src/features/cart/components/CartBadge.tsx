"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "../hooks/use-cart";

export function CartBadge() {
  const { totalItems, openDrawer } = useCart();
  const previousRef = useRef(totalItems);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (totalItems > previousRef.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 360);
      previousRef.current = totalItems;
      return () => clearTimeout(t);
    }
    previousRef.current = totalItems;
  }, [totalItems]);

  return (
    <button
      onClick={openDrawer}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-primary-foreground transition-colors duration-150 ease-out-expo hover:bg-white/10 active:scale-[0.95]",
        bump && "animate-bump",
      )}
      aria-label={`Ver pedido (${totalItems} ${totalItems === 1 ? "producto" : "productos"})`}
    >
      <ShoppingBag size={20} />
      {totalItems > 0 && (
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-sm transition-transform duration-200 ease-spring",
            bump && "scale-125",
          )}
          aria-hidden="true"
        >
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  );
}
