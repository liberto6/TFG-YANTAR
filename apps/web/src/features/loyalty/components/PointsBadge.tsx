"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useLoyaltyBalance } from "../hooks/use-loyalty";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function PointsBadge() {
  const { isAuthenticated } = useAuth();
  const { data: balance } = useLoyaltyBalance();

  if (!isAuthenticated || balance === undefined) return null;

  return (
    <Link
      href="/profile"
      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-caption font-semibold text-primary-foreground transition-colors hover:bg-white/25"
      aria-label={`${balance.currentBalance} puntos de fidelidad. Ir al perfil.`}
    >
      <Sparkles size={14} aria-hidden="true" />
      {balance.currentBalance}
    </Link>
  );
}
