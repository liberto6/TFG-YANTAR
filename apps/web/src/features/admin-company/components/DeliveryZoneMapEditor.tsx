"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useEffect, useRef, useState } from "react";
import type { GeoPolygon } from "../hooks/use-delivery-zones";

interface Props {
  zoneId: string;
  zoneName: string;
  existingPolygon: GeoPolygon | null;
  center?: [number, number];
  onSave: (polygon: GeoPolygon | null) => void;
  isSaving?: boolean;
}

export function DeliveryZoneMapEditor({
  zoneName,
  existingPolygon,
  center,
  onSave,
  isSaving,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [pendingPolygon, setPendingPolygon] = useState<GeoPolygon | null>(
    existingPolygon,
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapCenter: [number, number] = center ?? [40.4168, -3.7038];

    Promise.all([import("leaflet"), import("leaflet-draw")]).then(([L]) => {
      const Lmap = L.default ?? (L as any);

      // Fix broken icon paths under webpack bundling
      delete (Lmap.Icon.Default.prototype as any)._getIconUrl;
      Lmap.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = Lmap.map(containerRef.current!, { zoomControl: true }).setView(
        mapCenter,
        13,
      );

      Lmap.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const drawnItems = new Lmap.FeatureGroup();
      map.addLayer(drawnItems);

      // Load existing polygon if any
      if (existingPolygon) {
        const geoLayer = Lmap.geoJSON(existingPolygon as any, {
          style: { color: "#0ea5e9", weight: 2, fillOpacity: 0.15 },
        });
        geoLayer.getLayers().forEach((l: any) => drawnItems.addLayer(l));
        try {
          map.fitBounds(geoLayer.getBounds().pad(0.2));
        } catch {
          // bounds may be empty, ignore
        }
      }

      // Draw controls — polygon only
      const drawControl = new (Lmap.Control as any).Draw({
        position: "topleft",
        edit: { featureGroup: drawnItems, remove: true },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: { color: "#0ea5e9", weight: 2, fillOpacity: 0.15 },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
      });
      map.addControl(drawControl);

      // New polygon drawn
      map.on((Lmap.Draw as any).Event.CREATED, (e: any) => {
        drawnItems.clearLayers();
        drawnItems.addLayer(e.layer);
        const geo = e.layer.toGeoJSON().geometry as GeoPolygon;
        setPendingPolygon(geo);
        setHasChanges(true);
      });

      // Polygon edited
      map.on((Lmap.Draw as any).Event.EDITED, () => {
        const layers = drawnItems.getLayers();
        if (layers.length > 0) {
          const geo = (layers[0] as any).toGeoJSON().geometry as GeoPolygon;
          setPendingPolygon(geo);
          setHasChanges(true);
        }
      });

      // Polygon deleted
      map.on((Lmap.Draw as any).Event.DELETED, () => {
        setPendingPolygon(null);
        setHasChanges(true);
      });

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Dibuja el área de reparto para <strong>{zoneName}</strong> sobre el
        mapa. Usa la herramienta de polígono{" "}
        <span className="font-mono">(▱)</span> en la barra lateral izquierda.
      </p>
      <div
        ref={containerRef}
        className="h-80 w-full rounded-xl border border-border overflow-hidden"
        style={{ zIndex: 0 }}
      />
      <div className="flex items-center gap-3">
        {hasChanges ? (
          <button
            onClick={() => {
              onSave(pendingPolygon);
              setHasChanges(false);
            }}
            disabled={isSaving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar zona en mapa"}
          </button>
        ) : (
          existingPolygon && (
            <span className="text-xs text-green-600 font-medium">
              ✓ Zona guardada en mapa
            </span>
          )
        )}
        {!existingPolygon && !hasChanges && (
          <span className="text-xs text-muted-foreground">
            Sin polígono definido — dibuja uno en el mapa
          </span>
        )}
      </div>
    </div>
  );
}
