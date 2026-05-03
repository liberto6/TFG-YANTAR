"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useCreateBranch,
  useUpdateBranch,
  type BranchDto,
  type ServiceMode,
} from "../hooks/use-admin-branches";

const SERVICE_MODE_OPTIONS: { value: ServiceMode; label: string }[] = [
  { value: "DELIVERY", label: "Delivery a domicilio" },
  { value: "PICKUP", label: "Recogida en tienda" },
  { value: "DINE_IN", label: "Comer en local" },
];

interface BranchFormProps {
  branch?: BranchDto;
}

export function BranchForm({ branch }: BranchFormProps) {
  const router = useRouter();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const [name, setName] = useState(branch?.name ?? "");
  const [address, setAddress] = useState(branch?.address ?? "");
  const [phone, setPhone] = useState(branch?.phone ?? "");
  const [email, setEmail] = useState(branch?.email ?? "");
  const [serviceModes, setServiceModes] = useState<Set<ServiceMode>>(
    new Set(branch?.serviceModes ?? ["DELIVERY", "PICKUP"]),
  );
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!branch;
  const isPending = createMutation.isPending || updateMutation.isPending;

  function toggleMode(mode: ServiceMode) {
    setServiceModes((prev) => {
      const next = new Set(prev);
      next.has(mode) ? next.delete(mode) : next.add(mode);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      address,
      phone: phone || undefined,
      email: email || undefined,
      serviceModes: Array.from(serviceModes) as ServiceMode[],
    };
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: branch.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/admin/branches");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la sede");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium">Información básica</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nombre *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Sede Centro" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Dirección *</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Calle Mayor 1, Madrid" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Teléfono</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+34 600 000 000" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sede@restaurante.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-medium">Modalidades de servicio</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {SERVICE_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleMode(opt.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                serviceModes.has(opt.value)
                  ? "border-primary bg-primary text-white"
                  : "border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear sede"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/branches")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
