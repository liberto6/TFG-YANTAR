"use client";

import { Banknote, Bike, Clock, CreditCard, MapPin } from "lucide-react";
import { DemoChapter } from "../components/DemoChapter";
import { DEMO_COMPANY, DEMO_CUSTOMER, DEMO_ORDER } from "../data/napoli-fixtures";

/**
 * Paso 13 — Carlos confirma su pedido. Muestra dirección de entrega, franja
 * horaria, método de pago y resumen con el total final (33 €).
 */
export function Step13Checkout() {
  const slots = ["13:30", "14:00", "14:30", "15:00", "15:30"];

  return (
    <DemoChapter url="napoli.yantar.app/checkout" device="mobile">
      <div className="min-h-[580px] space-y-4 bg-background p-4">
        <h1 className="text-h2 text-foreground">Confirmar pedido</h1>

        <Card>
          <Row icon={<Bike size={14} />} label="Envío a domicilio">
            <span className="text-body-sm text-foreground">
              {DEMO_CUSTOMER.address}
            </span>
          </Row>
        </Card>

        <Card>
          <p className="mb-2 text-caption font-medium uppercase tracking-wider text-muted-foreground">
            <Clock size={12} className="mr-1 inline" /> ¿Cuándo lo quieres?
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Pill>Lo antes posible</Pill>
            {slots.map((s) => (
              <Pill key={s} active={s === DEMO_ORDER.scheduledTime}>
                {s}
              </Pill>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-2 text-caption font-medium uppercase tracking-wider text-muted-foreground">
            Método de pago
          </p>
          <div className="grid grid-cols-2 gap-2">
            <PaymentMode icon={<Banknote size={14} />} label="Efectivo" active />
            <PaymentMode icon={<CreditCard size={14} />} label="Tarjeta" />
          </div>
        </Card>

        <Card>
          <p className="mb-2 text-caption font-medium uppercase tracking-wider text-muted-foreground">
            Resumen
          </p>
          <div className="space-y-1.5">
            {DEMO_ORDER.items.map((it, i) => (
              <div key={i} className="text-body-sm">
                <div className="flex justify-between">
                  <span className="text-foreground">
                    <span className="text-muted-foreground">{it.quantity}×</span>{" "}
                    {it.dishName}
                  </span>
                  <span className="tabular-nums text-foreground">
                    {(it.unitPrice * it.quantity).toFixed(2)} €
                  </span>
                </div>
                <p className="text-caption text-muted-foreground">
                  {it.variant}
                  {it.modifiers.length > 0 ? ` · ${it.modifiers.join(", ")}` : ""}
                </p>
              </div>
            ))}
            <div className="space-y-0.5 border-t border-border pt-1.5 text-body-sm">
              <Line label="Subtotal" value={`${DEMO_ORDER.subtotal.toFixed(2)} €`} />
              <Line label="Envío" value={`${DEMO_ORDER.deliveryFee.toFixed(2)} €`} />
              <div className="flex justify-between pt-1 text-body font-semibold">
                <span>Total</span>
                <span
                  className="tabular-nums"
                  style={{ color: DEMO_COMPANY.colorPrimary }}
                >
                  {DEMO_ORDER.total.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </Card>

        <button
          className="flex w-full items-center justify-between rounded-md px-4 py-3 text-body font-medium text-primary-foreground shadow-sm"
          style={{ background: DEMO_COMPANY.colorPrimary }}
        >
          <span>Confirmar pedido</span>
          <span className="tabular-nums">{DEMO_ORDER.total.toFixed(2)} €</span>
        </button>
      </div>
    </DemoChapter>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-surface p-3">{children}</div>;
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-caption text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
          <MapPin size={12} className="text-muted-foreground" />
          {children}
        </div>
      </div>
    </div>
  );
}

function Pill({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={[
        "rounded-full border px-2.5 py-1 text-caption",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function PaymentMode({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-body-sm",
        active ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground",
      ].join(" ")}
    >
      {icon}
      {label}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
