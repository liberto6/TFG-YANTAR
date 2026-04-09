"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useBranches, BranchSummary } from "../hooks/use-branches";
import { useCheckDelivery } from "../hooks/use-check-delivery";
import { useBranch } from "../context/branch-context";

interface Props {
  franchiseName: string;
  logoUrl: string | null;
  welcomeMessage: string | null;
}

type Step = "branches" | "mode" | "address";

export function LandingPage({ franchiseName, logoUrl, welcomeMessage }: Props) {
  const router = useRouter();
  const { data: branches, isLoading } = useBranches();
  const { checkDelivery, isChecking, error: deliveryError, clearError } = useCheckDelivery();
  const { selectBranch } = useBranch();

  const [step, setStep] = useState<Step>("branches");
  const [selected, setSelected] = useState<BranchSummary | null>(null);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  function handlePickBranch(branch: BranchSummary) {
    setSelected(branch);
    setStep("mode");
  }

  function handlePickup() {
    if (!selected) return;
    selectBranch({
      id: selected.id,
      name: selected.name,
      address: selected.address,
      deliveryMode: "PICKUP",
      deliveryFee: 0,
    });
    router.push("/menu");
  }

  async function handleDelivery() {
    if (!selected || !address.trim()) {
      setAddressError("Introduce tu dirección.");
      return;
    }
    setAddressError(null);
    clearError();

    const result = await checkDelivery(selected.id, address.trim());

    if (result === null && !deliveryError) {
      // No zone found
      setAddressError(
        "Tu dirección está fuera de nuestra zona de reparto. Puedes recoger tu pedido en el local.",
      );
      return;
    }

    if (result) {
      selectBranch({
        id: selected.id,
        name: selected.name,
        address: selected.address,
        deliveryMode: "DELIVERY",
        deliveryFee: result.deliveryFee,
        deliveryZoneId: result.zoneId,
        customerAddress: address.trim(),
      });
      router.push("/menu");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={franchiseName}
            width={80}
            height={80}
            className="rounded-2xl object-contain"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {franchiseName}
        </h1>
        {welcomeMessage && (
          <p className="text-muted-foreground text-base max-w-sm">{welcomeMessage}</p>
        )}
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Step 1: Choose branch */}
        {step === "branches" && (
          <>
            <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              ¿Desde qué local quieres pedir?
            </p>
            {isLoading && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            )}
            {branches?.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handlePickBranch(branch)}
                className="w-full rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
              >
                <p className="font-semibold text-foreground text-lg">{branch.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{branch.address}</p>
                <div className="flex gap-2 mt-2">
                  {branch.serviceModes.includes("PICKUP") && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      Recogida
                    </span>
                  )}
                  {branch.serviceModes.includes("DELIVERY") && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      Domicilio
                    </span>
                  )}
                </div>
              </button>
            ))}
          </>
        )}

        {/* Step 2: Choose mode */}
        {step === "mode" && selected && (
          <>
            <button
              onClick={() => setStep("branches")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              ← Cambiar local
            </button>
            <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              {selected.name} — ¿Cómo quieres recibirlo?
            </p>

            {selected.serviceModes.includes("PICKUP") && (
              <button
                onClick={handlePickup}
                className="w-full rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
              >
                <p className="font-semibold text-foreground text-lg">🛍 Recoger en el local</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sin gastos de envío · Recoge cuando esté listo
                </p>
              </button>
            )}

            {selected.serviceModes.includes("DELIVERY") && (
              <button
                onClick={() => setStep("address")}
                className="w-full rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
              >
                <p className="font-semibold text-foreground text-lg">🚴 Envío a domicilio</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Te lo llevamos a tu dirección
                </p>
              </button>
            )}
          </>
        )}

        {/* Step 3: Enter address */}
        {step === "address" && selected && (
          <>
            <button
              onClick={() => { setStep("mode"); setAddressError(null); clearError(); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              ← Volver
            </button>
            <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
              ¿A dónde te lo enviamos?
            </p>

            <input
              type="text"
              placeholder="Calle, número, ciudad..."
              value={address}
              onChange={(e) => { setAddress(e.target.value); setAddressError(null); clearError(); }}
              onKeyDown={(e) => e.key === "Enter" && handleDelivery()}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {(addressError || deliveryError) && (
              <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-800">
                {addressError ?? deliveryError}
                {addressError?.includes("fuera de nuestra zona") && (
                  <button
                    onClick={handlePickup}
                    className="mt-2 block w-full rounded-lg bg-orange-100 px-3 py-2 text-xs font-medium text-orange-900 hover:bg-orange-200"
                  >
                    Ir a recogerlo al local →
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleDelivery}
              disabled={isChecking || !address.trim()}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isChecking ? "Verificando zona..." : "Confirmar dirección"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
