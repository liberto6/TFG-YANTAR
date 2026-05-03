"use client";

import { useCountUp } from "@/lib/use-count-up";

interface StatValueProps {
  value: number;
  format?: "number" | "currency";
  suffix?: string;
}

export function StatValue({ value, format = "number", suffix }: StatValueProps) {
  const animated = useCountUp(value, {
    duration: 720,
    decimals: format === "currency" ? 2 : 0,
  });

  if (format === "currency") {
    return (
      <>
        {animated.toFixed(2).replace(".", ",")} €
      </>
    );
  }

  return (
    <>
      {animated.toLocaleString("es-ES")}
      {suffix}
    </>
  );
}
