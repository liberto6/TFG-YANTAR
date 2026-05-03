import { cn } from "@/lib/cn";

interface PasswordStrengthProps {
  password: string;
}

export function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const LABELS = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"] as const;
const COLORS = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"];
const TEXT = ["text-danger", "text-danger", "text-warning", "text-info", "text-success"];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const score = scorePassword(password);
  return (
    <div className="space-y-1">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? COLORS[score] : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className={cn("text-caption", TEXT[score])} role="status" aria-live="polite">
        Seguridad: {LABELS[score]}
      </p>
    </div>
  );
}
