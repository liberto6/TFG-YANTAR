/**
 * Ilustraciones SVG inline — line art monochrome.
 * Heredan currentColor para integrarse con el theme.
 * Estilo minimalista profesional, sin elementos decorativos.
 */

const SIZE = 96;
const STROKE = "1.4";

interface IllustrationProps {
  size?: number;
  className?: string;
}

function base({ size = SIZE, className = "" }: IllustrationProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 96 96",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: STROKE,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

/** Carrito vacío con líneas de movimiento sutiles */
export function EmptyCartIllustration(props: IllustrationProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M22 28h7l5 32a4 4 0 0 0 4 3h22a4 4 0 0 0 4-3l4-22H32"
        opacity="0.85"
      />
      <circle cx="40" cy="74" r="3.5" />
      <circle cx="64" cy="74" r="3.5" />
      <path d="M50 36v8M50 48h.01" opacity="0.4" />
      <path d="M14 22h2M16 18h2" opacity="0.3" />
    </svg>
  );
}

/** Lista de pedidos vacía — ticket con líneas */
export function EmptyOrdersIllustration(props: IllustrationProps) {
  return (
    <svg {...base(props)}>
      <path d="M28 18h32a4 4 0 0 1 4 4v60l-7-5-7 5-7-5-7 5-7-5-7 5V22a4 4 0 0 1 4-4z" />
      <path d="M36 32h24M36 42h24M36 52h16" opacity="0.5" />
    </svg>
  );
}

/** Cocina tranquila — sartén con línea de descanso */
export function CalmKitchenIllustration(props: IllustrationProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 52h44a4 4 0 0 1 4 4v4a14 14 0 0 1-14 14H30a14 14 0 0 1-14-14v-4a4 4 0 0 1 4-4z" />
      <path d="M64 52l16-12" />
      <path d="M30 42c0-4 4-4 4-8s-4-4-4-8" opacity="0.5" />
      <path d="M42 42c0-4 4-4 4-8s-4-4-4-8" opacity="0.5" />
      <path d="M54 42c0-4 4-4 4-8s-4-4-4-8" opacity="0.5" />
    </svg>
  );
}

/** Sin sedes — edificio simple */
export function EmptyBranchesIllustration(props: IllustrationProps) {
  return (
    <svg {...base(props)}>
      <path d="M22 80V36l26-16 26 16v44" />
      <path d="M14 80h68" />
      <path d="M40 80V58h16v22" />
      <path d="M32 44h6M32 54h6M58 44h6M58 54h6" opacity="0.5" />
    </svg>
  );
}

/** Carta sin platos — plato y cubiertos */
export function EmptyMenuIllustration(props: IllustrationProps) {
  return (
    <svg {...base(props)}>
      <circle cx="48" cy="48" r="26" />
      <circle cx="48" cy="48" r="18" opacity="0.5" />
      <path d="M22 22l8 12M74 22l-8 12" opacity="0.4" />
    </svg>
  );
}

/** Filtros sin resultados — lupa con X */
export function NoResultsIllustration(props: IllustrationProps) {
  return (
    <svg {...base(props)}>
      <circle cx="42" cy="42" r="22" />
      <path d="M58 58l16 16" />
      <path d="M34 34l16 16M50 34L34 50" opacity="0.6" />
    </svg>
  );
}

/** 404 — brújula desorientada */
export function NotFoundIllustration(props: IllustrationProps) {
  return (
    <svg {...base(props)}>
      <circle cx="48" cy="48" r="32" />
      <path d="M48 22v6M48 68v6M22 48h6M68 48h6" opacity="0.5" />
      <path d="M40 56l8-22 8 22-8-6z" />
    </svg>
  );
}
