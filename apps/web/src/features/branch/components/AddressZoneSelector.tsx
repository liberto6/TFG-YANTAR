"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCheckDelivery,
  type DeliveryCheckResult,
} from "../hooks/use-check-delivery";

interface AddressSuggestion {
  displayName: string;
  shortName: string;
}

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

interface Props {
  branchId: string;
  initialAddress?: string;
  /** Llamado cuando el cliente confirma una dirección dentro de zona. */
  onConfirmed: (result: DeliveryCheckResult, address: string) => void;
  /** Etiqueta del botón principal; por defecto "Confirmar dirección". */
  confirmLabel?: string;
  /** Render extra que se muestra dentro del aviso "fuera de zona" (p. ej. botón para cambiar a pickup). */
  outOfZoneFallback?: ReactNode;
  /** Etiqueta del input. Por defecto "Dirección". */
  label?: string;
  inputId?: string;
}

/**
 * Captura una dirección con autocompletado (Nominatim/OSM) y la valida contra
 * las zonas de reparto de la sucursal vía useCheckDelivery. Componente reutilizable
 * entre la landing inicial y el checkout.
 */
export function AddressZoneSelector({
  branchId,
  initialAddress = "",
  onConfirmed,
  confirmLabel = "Confirmar dirección",
  outOfZoneFallback,
  label = "Dirección",
  inputId = "address-input",
}: Props) {
  const { checkDelivery, isChecking, error: deliveryError, clearError } =
    useCheckDelivery();

  const [address, setAddress] = useState(initialAddress);
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

  function handleSelectSuggestion(s: AddressSuggestion) {
    setAddress(s.shortName);
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

  async function handleConfirm() {
    if (!address.trim()) {
      setAddressError("Introduce tu dirección.");
      return;
    }
    setShowSuggestions(false);
    setAddressError(null);
    clearError();

    const result = await checkDelivery(branchId, address.trim());

    if (result === null && !deliveryError) {
      setAddressError(
        "Tu dirección está fuera de nuestra zona de reparto.",
      );
      return;
    }

    if (result) {
      onConfirmed(result, address.trim());
    }
  }

  const showOutOfZoneFallback =
    outOfZoneFallback &&
    addressError?.includes("fuera de nuestra zona");

  return (
    <div className="space-y-3">
      <div ref={wrapperRef} className="relative space-y-1.5">
        <Label htmlFor={inputId} required>
          {label}
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <MapPin size={16} />
          </span>
          <Input
            id={inputId}
            placeholder="Calle, número, ciudad..."
            value={address}
            invalid={Boolean(addressError || deliveryError)}
            onChange={(e) => handleAddressChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setShowSuggestions(false);
                handleConfirm();
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
          {showOutOfZoneFallback && <div className="mt-2">{outOfZoneFallback}</div>}
        </Alert>
      )}

      <Button
        size="lg"
        className="w-full"
        loading={isChecking}
        disabled={!address.trim()}
        onClick={handleConfirm}
      >
        {isChecking ? "Verificando zona…" : confirmLabel}
      </Button>
    </div>
  );
}
