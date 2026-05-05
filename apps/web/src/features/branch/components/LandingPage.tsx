"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Bike, ShoppingBag, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranches, BranchSummary } from "../hooks/use-branches";
import { useBranch } from "../context/branch-context";
import { AddressZoneSelector } from "./AddressZoneSelector";
import type { DeliveryCheckResult } from "../hooks/use-check-delivery";

interface Props {
  franchiseName: string;
  logoUrl: string | null;
  welcomeMessage: string | null;
  initialBranch?: BranchSummary | null;
}

type Step = "branches" | "mode" | "address";

function toServiceModes(
  modes: string[] | undefined,
): ("PICKUP" | "DELIVERY")[] | undefined {
  if (!modes) return undefined;
  return modes.filter(
    (m): m is "PICKUP" | "DELIVERY" => m === "PICKUP" || m === "DELIVERY",
  );
}

export function LandingPage({
  franchiseName,
  logoUrl,
  welcomeMessage,
  initialBranch,
}: Props) {
  const router = useRouter();
  const { data: branches, isLoading } = useBranches();
  const { selectBranch } = useBranch();

  const [step, setStep] = useState<Step>(initialBranch ? "mode" : "branches");
  const [selected, setSelected] = useState<BranchSummary | null>(
    initialBranch ?? null,
  );

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
      serviceModes: toServiceModes(selected.serviceModes),
    });
    router.push("/menu");
  }

  function handleDeliveryConfirmed(
    result: DeliveryCheckResult,
    confirmedAddress: string,
  ) {
    if (!selected) return;
    selectBranch({
      id: selected.id,
      name: selected.name,
      address: selected.address,
      deliveryMode: "DELIVERY",
      deliveryFee: result.deliveryFee,
      deliveryZoneId: result.zoneId,
      customerAddress: confirmedAddress,
      serviceModes: toServiceModes(selected.serviceModes),
      minOrderAmount: result.minOrderAmount,
    });
    router.push("/menu");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={franchiseName}
            width={80}
            height={80}
            className="rounded-2xl object-contain shadow-sm"
          />
        )}
        <h1 className="text-display text-foreground">{franchiseName}</h1>
        {welcomeMessage && (
          <p className="max-w-sm text-body text-muted-foreground">{welcomeMessage}</p>
        )}
      </div>

      <div key={step} className="w-full max-w-sm animate-fade-in space-y-3">
        {step === "branches" && (
          <>
            <p className="mb-4 text-center text-caption font-medium uppercase tracking-wider text-muted-foreground">
              ¿Desde qué local quieres pedir?
            </p>
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </div>
            )}
            {branches?.map((branch, i) => (
              <button
                key={branch.id}
                onClick={() => handlePickBranch(branch)}
                style={{ ["--i" as any]: i }}
                className="stagger-item group flex w-full items-start gap-4 rounded-2xl border border-border bg-surface p-4 text-left transition-[border-color,box-shadow,transform] duration-220 ease-out-expo hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.99] animate-fade-in-up"
              >
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Store size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-h3 text-foreground">{branch.name}</p>
                  <p className="mt-0.5 text-body-sm text-muted-foreground">{branch.address}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {branch.serviceModes.includes("PICKUP") && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                        <ShoppingBag size={11} /> Recogida
                      </span>
                    )}
                    {branch.serviceModes.includes("DELIVERY") && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                        <Bike size={11} /> Domicilio
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {step === "mode" && selected && (
          <>
            <button
              onClick={() => setStep("branches")}
              className="mb-2 inline-flex items-center gap-1.5 rounded-md text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft size={14} /> Cambiar local
            </button>
            <p className="mb-4 text-center text-caption font-medium uppercase tracking-wider text-muted-foreground">
              {selected.name} — ¿Cómo quieres recibirlo?
            </p>

            {selected.serviceModes.includes("PICKUP") && (
              <button
                onClick={handlePickup}
                className="flex w-full items-start gap-4 rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShoppingBag size={20} />
                </span>
                <div className="flex-1">
                  <p className="text-h3 text-foreground">Recoger en el local</p>
                  <p className="mt-0.5 text-body-sm text-muted-foreground">
                    Sin gastos de envío · Recoge cuando esté listo
                  </p>
                </div>
              </button>
            )}

            {selected.serviceModes.includes("DELIVERY") && (
              <button
                onClick={() => setStep("address")}
                className="flex w-full items-start gap-4 rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Bike size={20} />
                </span>
                <div className="flex-1">
                  <p className="text-h3 text-foreground">Envío a domicilio</p>
                  <p className="mt-0.5 text-body-sm text-muted-foreground">
                    Te lo llevamos a tu dirección
                  </p>
                </div>
              </button>
            )}
          </>
        )}

        {step === "address" && selected && (
          <>
            <button
              onClick={() => setStep("mode")}
              className="mb-2 inline-flex items-center gap-1.5 rounded-md text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <p className="mb-4 text-center text-caption font-medium uppercase tracking-wider text-muted-foreground">
              ¿A dónde te lo enviamos?
            </p>

            <AddressZoneSelector
              branchId={selected.id}
              onConfirmed={handleDeliveryConfirmed}
              outOfZoneFallback={
                selected.serviceModes.includes("PICKUP") ? (
                  <Button variant="outline" size="sm" onClick={handlePickup}>
                    Ir a recogerlo al local
                  </Button>
                ) : undefined
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
