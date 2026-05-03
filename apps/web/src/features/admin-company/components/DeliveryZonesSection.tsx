"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useConfirm } from "@/lib/confirm-provider";
import {
  useDeliveryZones,
  useCreateZone,
  useUpdateZone,
  useDeleteZone,
  useUpdateZonePolygon,
  type DeliveryZoneDto,
  type GeoPolygon,
} from "../hooks/use-delivery-zones";
import type { BranchDto } from "../hooks/use-admin-branches";

// SSR-safe dynamic import — Leaflet requires window
const DeliveryZoneMapEditor = dynamic(
  () =>
    import("./DeliveryZoneMapEditor").then((m) => ({
      default: m.DeliveryZoneMapEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 rounded-xl bg-muted animate-pulse" />
    ),
  },
);

interface Props {
  branch: BranchDto;
}

interface ZoneFormState {
  name: string;
  postalCodes: string;
  minOrderAmount: string;
  deliveryFee: string;
  estimatedTimeMinutes: string;
}

const EMPTY_FORM: ZoneFormState = {
  name: "",
  postalCodes: "",
  minOrderAmount: "0",
  deliveryFee: "2.50",
  estimatedTimeMinutes: "30",
};

function ZoneCard({
  zone,
  branch,
  onUpdate,
  onDelete,
  onSavePolygon,
  isSavingPolygon,
}: {
  zone: DeliveryZoneDto;
  branch: BranchDto;
  onUpdate: (id: string, data: Partial<ZoneFormState>) => void;
  onDelete: (id: string) => void;
  onSavePolygon: (id: string, polygon: GeoPolygon | null) => void;
  isSavingPolygon: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const confirm = useConfirm();
  const [form, setForm] = useState<ZoneFormState>({
    name: zone.name,
    postalCodes: zone.postalCodes.join(", "),
    minOrderAmount: String(zone.minOrderAmount),
    deliveryFee: String(zone.deliveryFee),
    estimatedTimeMinutes: String(zone.estimatedTimeMinutes),
  });

  async function askDelete() {
    const ok = await confirm({
      title: `¿Eliminar la zona "${zone.name}"?`,
      description:
        "Las direcciones que cubría esta zona dejarán de poder pedir a domicilio en esta sede. La acción no se puede deshacer.",
      confirmLabel: "Eliminar zona",
      variant: "danger",
    });
    if (ok) onDelete(zone.id);
  }

  const branchCenter: [number, number] | undefined =
    branch.latitude && branch.longitude
      ? [branch.latitude, branch.longitude]
      : undefined;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-2 w-2 rounded-full ${zone.isActive ? "bg-green-500" : "bg-muted-foreground"}`}
          />
          <div>
            <p className="font-semibold text-foreground">{zone.name}</p>
            <p className="text-xs text-muted-foreground">
              {zone.deliveryFee === 0
                ? "Envío gratis"
                : `${zone.deliveryFee.toFixed(2)} € envío`}{" "}
              · Mínimo {zone.minOrderAmount.toFixed(2)} € · ~
              {zone.estimatedTimeMinutes} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            {expanded ? "Ocultar mapa" : "Ver mapa"}
          </button>
          <button
            onClick={askDelete}
            className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="border-t border-border px-5 py-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Coste de envío (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={form.deliveryFee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryFee: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Pedido mínimo (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={form.minOrderAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minOrderAmount: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tiempo estimado (min)
              </label>
              <input
                type="number"
                min="1"
                value={form.estimatedTimeMinutes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    estimatedTimeMinutes: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Códigos postales (separados por coma)
              </label>
              <input
                type="text"
                value={form.postalCodes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postalCodes: e.target.value }))
                }
                placeholder="41001, 41002, 41003"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <button
            onClick={() => {
              onUpdate(zone.id, form);
              setEditing(false);
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Guardar cambios
          </button>
        </div>
      )}

      {/* Map editor */}
      {expanded && (
        <div className="border-t border-border px-5 py-4">
          <DeliveryZoneMapEditor
            zoneId={zone.id}
            zoneName={zone.name}
            existingPolygon={zone.polygon}
            center={branchCenter}
            onSave={(polygon) => onSavePolygon(zone.id, polygon)}
            isSaving={isSavingPolygon}
          />
        </div>
      )}
    </div>
  );
}

export function DeliveryZonesSection({ branch }: Props) {
  const { data: zones, isLoading } = useDeliveryZones(branch.id);
  const createZone = useCreateZone(branch.id);
  const updateZone = useUpdateZone(branch.id);
  const deleteZone = useDeleteZone(branch.id);
  const updatePolygon = useUpdateZonePolygon(branch.id);

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ZoneFormState>(EMPTY_FORM);
  const [createError, setCreateError] = useState<string | null>(null);

  function handleCreate() {
    const name = createForm.name.trim();
    if (!name) {
      setCreateError("El nombre es obligatorio.");
      return;
    }
    setCreateError(null);
    createZone.mutate(
      {
        name,
        postalCodes: createForm.postalCodes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        minOrderAmount: parseFloat(createForm.minOrderAmount) || 0,
        deliveryFee: parseFloat(createForm.deliveryFee) || 0,
        estimatedTimeMinutes: parseInt(createForm.estimatedTimeMinutes) || 30,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          setCreateForm(EMPTY_FORM);
        },
        onError: (err: any) => setCreateError(err.message),
      },
    );
  }

  function handleUpdate(id: string, form: Partial<ZoneFormState>) {
    updateZone.mutate({
      id,
      data: {
        name: (form.name as string).trim(),
        postalCodes: (form.postalCodes as string)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        minOrderAmount: parseFloat(form.minOrderAmount as string) || 0,
        deliveryFee: parseFloat(form.deliveryFee as string) || 0,
        estimatedTimeMinutes:
          parseInt(form.estimatedTimeMinutes as string) || 30,
      },
    });
  }

  function handleSavePolygon(id: string, polygon: GeoPolygon | null) {
    updatePolygon.mutate({ id, polygon });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Zonas de reparto
          </h3>
          <p className="text-sm text-muted-foreground">
            Define las áreas donde esta sede realiza entregas a domicilio.
          </p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {showCreate ? "Cancelar" : "+ Nueva zona"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Nueva zona de reparto</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Zona Centro, Zona Norte…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Coste de envío (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={createForm.deliveryFee}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, deliveryFee: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Pedido mínimo (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={createForm.minOrderAmount}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    minOrderAmount: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Tiempo estimado (min)
              </label>
              <input
                type="number"
                min="1"
                value={createForm.estimatedTimeMinutes}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    estimatedTimeMinutes: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Códigos postales (separados por coma)
              </label>
              <input
                type="text"
                value={createForm.postalCodes}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    postalCodes: e.target.value,
                  }))
                }
                placeholder="41001, 41002, 41003"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          {createError && (
            <p className="text-sm text-red-600">{createError}</p>
          )}
          <button
            onClick={handleCreate}
            disabled={createZone.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {createZone.isPending ? "Creando…" : "Crear zona"}
          </button>
        </div>
      )}

      {/* Zones list */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && zones?.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <p className="text-muted-foreground text-sm">
            No hay zonas de reparto definidas. Crea la primera para activar el
            delivery.
          </p>
        </div>
      )}

      {zones?.map((zone) => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          branch={branch}
          onUpdate={handleUpdate}
          onDelete={(id) => deleteZone.mutate(id)}
          onSavePolygon={handleSavePolygon}
          isSavingPolygon={updatePolygon.isPending}
        />
      ))}
    </div>
  );
}
