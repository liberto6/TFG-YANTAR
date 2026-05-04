"use client";

import { useMemo } from "react";

interface SparklineProps {
  /** Serie de valores a representar (uno por punto). */
  data: number[];
  width?: number;
  height?: number;
  /** Color del trazo y del área. Acepta cualquier color CSS (incluyendo `currentColor`). */
  stroke?: string;
  strokeWidth?: number;
  /** Si true (default), pinta área degradada bajo la línea. */
  fillArea?: boolean;
  className?: string;
}

/**
 * Mini gráfico de línea (sparkline) puramente SVG, sin dependencias.
 *
 * Pensado para acompañar KPIs en dashboard. Renderiza una serie corta
 * (4-30 puntos) como línea suave + área degradada opcional. Si todos los
 * puntos valen 0, muestra una línea plana centrada.
 */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  stroke = "currentColor",
  strokeWidth = 1.5,
  fillArea = true,
  className,
}: SparklineProps) {
  const path = useMemo(() => buildPath(data, width, height), [data, width, height]);
  const areaPath = useMemo(
    () => buildAreaPath(data, width, height),
    [data, width, height],
  );
  const gradientId = useMemo(
    () => `spark-grad-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  if (data.length < 2) {
    // Línea plana centrada cuando no hay datos suficientes.
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeOpacity={0.3}
          strokeDasharray="2 3"
        />
      </svg>
    );
  }

  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fillArea && <path d={areaPath} fill={`url(#${gradientId})`} />}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildPath(data: number[], w: number, h: number): string {
  if (data.length < 2) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * stepX;
      // Padding vertical de 2px arriba y abajo para que el trazo no se corte.
      const y = h - 2 - ((v - min) / range) * (h - 4);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(data: number[], w: number, h: number): string {
  const linePath = buildPath(data, w, h);
  if (!linePath) return "";
  // Cierra el path bajando al borde inferior y volviendo al origen.
  return `${linePath} L ${w} ${h} L 0 ${h} Z`;
}
