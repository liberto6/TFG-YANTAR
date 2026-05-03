"use client";

import { Clock, Map as MapIcon } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { AdminSidebar } from "./04-admin-empty";

/**
 * Paso 7 — Ana define horarios por día y dibuja la zona de reparto sobre un
 * mapa esquemático. El polígono es un SVG simulando el dibujo final con
 * leaflet-draw.
 */
export function Step07HoursZones() {
  const days = [
    { id: "L", label: "Lunes" },
    { id: "M", label: "Martes" },
    { id: "X", label: "Miércoles" },
    { id: "J", label: "Jueves" },
    { id: "V", label: "Viernes" },
    { id: "S", label: "Sábado" },
    { id: "D", label: "Domingo" },
  ];

  return (
    <DemoChapter url="napoli.yantar.app/admin/branches/centro">
      <div className="flex">
        <AdminSidebar active="branches" />
        <div className="flex-1 grid gap-5 p-6 lg:grid-cols-2">
          {/* Horarios */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-primary" />
              <h2 className="text-h3 text-foreground">Horarios</h2>
            </div>
            <ul className="space-y-1.5">
              {days.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-1.5 text-body-sm"
                >
                  <span className="font-medium text-foreground">{d.label}</span>
                  <span className="font-mono text-muted-foreground">12:00 — 23:00</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mapa con polígono */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapIcon size={14} className="text-primary" />
              <h2 className="text-h3 text-foreground">Zona de reparto</h2>
            </div>
            <FakeLeafletMap />
            <div className="grid grid-cols-3 gap-2 text-caption">
              <ZoneInfo label="Pedido mín." value="15 €" />
              <ZoneInfo label="Envío" value="2,50 €" />
              <ZoneInfo label="Tiempo" value="30 min" />
            </div>
          </div>
        </div>
      </div>
    </DemoChapter>
  );
}

function ZoneInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-2 text-center">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function FakeLeafletMap() {
  return (
    <div className="relative h-48 overflow-hidden rounded-lg border border-border bg-[#dbeafe]">
      {/* Calles simuladas */}
      <svg
        viewBox="0 0 320 200"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="320" height="200" fill="url(#grid)" />
        {/* Calles principales */}
        <line x1="0" y1="100" x2="320" y2="100" stroke="#94a3b8" strokeWidth="3" />
        <line x1="160" y1="0" x2="160" y2="200" stroke="#94a3b8" strokeWidth="3" />
        <line x1="0" y1="50" x2="320" y2="50" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="0" y1="150" x2="320" y2="150" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="80" y1="0" x2="80" y2="200" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="240" y1="0" x2="240" y2="200" stroke="#cbd5e1" strokeWidth="2" />

        {/* Polígono de zona */}
        <polygon
          points="80,50 240,50 270,120 200,170 100,170 50,110"
          fill="rgba(14,165,233,0.18)"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeDasharray="0"
        />

        {/* Pin del local */}
        <g transform="translate(160 100)">
          <circle r="8" fill="#c0392b" />
          <circle r="3" fill="#fff" />
        </g>
      </svg>

      <span className="absolute bottom-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
        Leaflet · OpenStreetMap
      </span>
    </div>
  );
}
