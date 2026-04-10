"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useOperatingHours,
  useSetOperatingHours,
  DAY_NAMES,
  DEFAULT_HOURS,
  type OperatingHourDto,
} from "../hooks/use-operating-hours";

interface HoursEditorProps {
  branchId: string;
}

type HoursState = Array<{
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}>;

export function HoursEditor({ branchId }: HoursEditorProps) {
  const { data: savedHours, isLoading } = useOperatingHours(branchId);
  const setHoursMutation = useSetOperatingHours(branchId);
  const [hours, setHours] = useState<HoursState>(DEFAULT_HOURS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!savedHours || savedHours.length === 0) return;
    const merged = DEFAULT_HOURS.map((def) => {
      const found = savedHours.find((h: OperatingHourDto) => h.dayOfWeek === def.dayOfWeek);
      return found ? { dayOfWeek: found.dayOfWeek, openTime: found.openTime, closeTime: found.closeTime, isClosed: found.isClosed } : def;
    });
    setHours(merged);
  }, [savedHours]);

  function updateHour(day: number, field: keyof HoursState[0], value: string | boolean) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === day ? { ...h, [field]: value } : h)),
    );
    setSaved(false);
  }

  async function handleSave() {
    await setHoursMutation.mutateAsync({ hours });
    setSaved(true);
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="font-medium">Horarios de apertura</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {hours.map((h) => (
          <div key={h.dayOfWeek} className="flex items-center gap-3 py-1">
            <span className="w-24 text-sm font-medium text-foreground">{DAY_NAMES[h.dayOfWeek]}</span>
            <input
              type="checkbox"
              checked={h.isClosed}
              onChange={(e) => updateHour(h.dayOfWeek, "isClosed", e.target.checked)}
              id={`closed-${h.dayOfWeek}`}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor={`closed-${h.dayOfWeek}`} className="text-sm text-muted-foreground">
              Cerrado
            </label>
            {!h.isClosed && (
              <>
                <input
                  type="time"
                  value={h.openTime}
                  onChange={(e) => updateHour(h.dayOfWeek, "openTime", e.target.value)}
                  className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">—</span>
                <input
                  type="time"
                  value={h.closeTime}
                  onChange={(e) => updateHour(h.dayOfWeek, "closeTime", e.target.value)}
                  className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </>
            )}
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={setHoursMutation.isPending} size="sm">
            {setHoursMutation.isPending ? "Guardando..." : "Guardar horarios"}
          </Button>
          {saved && <span className="text-sm text-green-600">Guardado</span>}
        </div>
      </CardContent>
    </Card>
  );
}
