"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Bike,
  Loader2,
  MapPin,
  ShoppingBag,
  Store,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranches, BranchSummary } from "../hooks/use-branches";
import { useCheckDelivery } from "../hooks/use-check-delivery";
import { useBranch } from "../context/branch-context";

interface Props {
  franchiseName: string;
  logoUrl: string | null;
  welcomeMessage: string | null;
  initialBranch?: BranchSummary | null;
}

interface AddressSuggestion {
  displayName: string;
  shortName: string;
}

type Step = "branches" | "mode" | "address";

async function fetchSuggestions(query: string): Promise<AddressSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&countrycodes=es&addressdetails=1`,
      { headers: { "Accept-Language": "es" } },
    );
    const data = await res.json();
    return data.map((item: any) => {
      const a = item.address ?? {};
      const parts = [
        a.road && a.house_number ? `${a.road}, ${a.house_number}` : a.road,
        a.city ?? a.town ?? a.village ?? a.municipality,
        a.state,
      ].filter(Boolean);
      return {
        displayName: item.display_name,
        shortName: parts.length >= 2 ? parts.join(", ") : item.display_name,
      };
    });
  } catch {
    return [];
  }
}

export function LandingPage({
  franchiseName,
  logoUrl,
  welcomeMessage,
  initialBranch,
}: Props) {
  const router = useRouter();
  const { data: branches, isLoading } = useBranches();
  const { checkDelivery, isChecking, error: deliveryError, clearError } = useCheckDelivery();
  const { selectBranch } = useBranch();

  const [step, setStep] = useState<Step>(initialBranch ? "mode" : "branches");
  const [selected, setSelected] = useState<BranchSummary | null>(
    initialBranch ?? null,
  );
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (address.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      const results = await fetchSuggestions(address);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setIsFetchingSuggestions(false);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [address]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelectSuggestion(suggestion: AddressSuggestion) {
    setAddress(suggestion.shortName);
    setSuggestions([]);
    setShowSuggestions(false);
    setAddressError(null);
    clearError();
  }

  function handleAddressChange(value: string) {
    setAddress(value);
    setAddressError(null);
    clearError();
  }

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
    setShowSuggestions(false);
    setAddressError(null);
    clearError();

    const result = await checkDelivery(selected.id, address.trim());

    if (result === null && !deliveryError) {
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
              onClick={() => {
                setStep("mode");
                setAddressError(null);
                clearError();
                setShowSuggestions(false);
              }}
              className="mb-2 inline-flex items-center gap-1.5 rounded-md text-body-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <p className="mb-4 text-center text-caption font-medium uppercase tracking-wider text-muted-foreground">
              ¿A dónde te lo enviamos?
            </p>

            <div ref={wrapperRef} className="relative space-y-1.5">
              <Label htmlFor="address-input" required>
                Dirección
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <MapPin size={16} />
                </span>
                <Input
                  id="address-input"
                  placeholder="Calle, número, ciudad..."
                  value={address}
                  invalid={Boolean(addressError || deliveryError)}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowSuggestions(false);
                      handleDelivery();
                    }
                    if (e.key === "Escape") setShowSuggestions(false);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  autoComplete="off"
                  className="pl-9 pr-9"
                />
                {isFetchingSuggestions && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                    <Loader2 size={16} className="animate-spin" />
                  </span>
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg animate-fade-in">
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(s)}
                        className="flex w-full items-start gap-2 border-b border-border px-3 py-2.5 text-left text-body-sm transition-colors last:border-0 hover:bg-secondary"
                      >
                        <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                        <span className="font-medium text-foreground">{s.shortName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(addressError || deliveryError) && (
              <Alert variant="warning" heading="No podemos entregar ahí">
                {addressError ?? deliveryError}
                {addressError?.includes("fuera de nuestra zona") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handlePickup}
                  >
                    Ir a recogerlo al local
                  </Button>
                )}
              </Alert>
            )}

            <Button
              size="lg"
              className="w-full"
              loading={isChecking}
              disabled={!address.trim()}
              onClick={handleDelivery}
            >
              {isChecking ? "Verificando zona…" : "Confirmar dirección"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
