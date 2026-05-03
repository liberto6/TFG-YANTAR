import { type SVGAttributes } from "react";
import { cn } from "@/lib/cn";

interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function Spinner({ className = "", size = 16, ...props }: SpinnerProps) {
  return (
    <svg
      className={cn("animate-spin", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M12 2a10 10 0 0110 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
