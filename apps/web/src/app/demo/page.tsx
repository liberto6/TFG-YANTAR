import type { Metadata } from "next";
import { DemoPlayer } from "@/features/demo/components/DemoPlayer";

export const metadata: Metadata = {
  title: "Demo guiada — Yantar",
  description:
    "Recorrido completo del sistema Yantar: cómo Ana monta su pizzería, cómo Carlos hace un pedido y cómo el cocinero lo procesa, todo en una única instancia SaaS multi-tenant.",
};

export default function DemoPage() {
  return <DemoPlayer />;
}
