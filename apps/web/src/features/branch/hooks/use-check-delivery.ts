import { useState } from "react";
import { api } from "@/lib/api-client";

const COMPANY_SLUG = process.env.NEXT_PUBLIC_COMPANY_SLUG!;

export interface DeliveryCheckResult {
  zoneId: string;
  zoneName: string;
  deliveryFee: number;
  estimatedTimeMinutes: number;
  minOrderAmount: number;
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { "Accept-Language": "es" } },
    );
    const data = await res.json();
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export function useCheckDelivery() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkDelivery(
    branchId: string,
    address: string,
  ): Promise<DeliveryCheckResult | null> {
    setIsChecking(true);
    setError(null);
    try {
      const coords = await geocodeAddress(address);
      if (!coords) {
        setError("No se pudo localizar esa dirección. Revísala e inténtalo de nuevo.");
        return null;
      }
      const result = await api.post<DeliveryCheckResult | null>(
        `/companies/${COMPANY_SLUG}/check-delivery`,
        { branchId, lat: coords.lat, lng: coords.lng },
      );
      return result;
    } catch {
      setError("Error al verificar la zona de reparto.");
      return null;
    } finally {
      setIsChecking(false);
    }
  }

  return { checkDelivery, isChecking, error, clearError: () => setError(null) };
}
