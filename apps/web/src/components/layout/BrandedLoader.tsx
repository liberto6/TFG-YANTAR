import Image from "next/image";
import { cn } from "@/lib/cn";

interface BrandedLoaderProps {
  logoUrl?: string | null;
  name?: string | null;
  variant?: "fullscreen" | "inline";
  message?: string;
}

export function BrandedLoader({
  logoUrl,
  name,
  variant = "fullscreen",
  message,
}: BrandedLoaderProps) {
  const initial = name?.[0]?.toUpperCase() ?? "Y";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message ?? "Cargando"}
      className={cn(
        "flex flex-col items-center justify-center gap-5 bg-background animate-fade-in",
        variant === "fullscreen" ? "min-h-screen" : "min-h-[60vh]",
      )}
    >
      <div className="relative">
        <span className="absolute inset-0 -m-2 rounded-2xl bg-primary/10 blur-xl animate-pulse-soft" aria-hidden="true" />
        <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name ?? "Logo"}
              width={80}
              height={80}
              priority
              className="h-full w-full object-contain animate-pulse-soft"
            />
          ) : (
            <span className="text-h1 font-bold text-primary animate-pulse-soft">
              {initial}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-primary" />
        </div>
        {(name || message) && (
          <p className="text-caption text-muted-foreground">
            {message ?? `Cargando ${name}…`}
          </p>
        )}
      </div>
    </div>
  );
}
