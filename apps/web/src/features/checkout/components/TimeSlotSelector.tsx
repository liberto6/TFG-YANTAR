"use client";

import { useTimeSlots, TimeSlot } from "../hooks/use-time-slots";

interface Props {
  branchId: string;
  value: string | null; // null = ASAP
  onChange: (value: string | null) => void;
}

export function TimeSlotSelector({ branchId, value, onChange }: Props) {
  const { data, isLoading } = useTimeSlots(branchId);

  if (isLoading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-16 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  const slots: TimeSlot[] = data?.slots ?? [];

  return (
    <div className="flex gap-2 flex-wrap">
      {/* ASAP option — always first */}
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          value === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-foreground hover:bg-muted"
        }`}
      >
        Lo antes posible
      </button>

      {slots.length === 0 && (
        <p className="text-sm text-muted-foreground self-center">
          No hay más franjas disponibles hoy
        </p>
      )}

      {slots.map((slot) => (
        <button
          key={slot.value}
          type="button"
          onClick={() => onChange(slot.value)}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
            value === slot.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-foreground hover:bg-muted"
          }`}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}
