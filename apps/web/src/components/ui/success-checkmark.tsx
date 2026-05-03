import { cn } from "@/lib/cn";

interface SuccessCheckmarkProps {
  size?: number;
  className?: string;
}

/**
 * Checkmark animado tipo Stripe — círculo que aparece con scale,
 * anillo de eco y trazo del check con stroke-dashoffset.
 */
export function SuccessCheckmark({ size = 80, className = "" }: SuccessCheckmarkProps) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Operación completada"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-success/30 animate-ping-ring"
      />
      <span
        aria-hidden="true"
        className="relative flex h-full w-full items-center justify-center rounded-full bg-success animate-scale-in shadow-[0_8px_24px_-8px_hsl(var(--success)/0.5)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-1/2 w-1/2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="white"
            strokeWidth="2.75"
            strokeDasharray="30"
            className="animate-draw-check"
          />
        </svg>
      </span>
    </div>
  );
}
