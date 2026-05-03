"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bike,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
  KanbanSquare,
  LayoutDashboard,
  Smartphone,
  Sparkles,
  Store,
  Wallet,
  Zap,
} from "lucide-react";

/**
 * Landing pública del SaaS Yantar (yantar.app raíz, sin tenant resuelto).
 *
 * Una sola pantalla con dos pestañas:
 *   - "Para tu restaurante" (comercial): propuesta de valor, vistas, comparativa.
 *   - "Sobre el proyecto"   (académica):  TFG, stack, arquitectura, repositorio.
 */
export function SaaSLanding() {
  const [tab, setTab] = useState<"commercial" | "project">("commercial");

  function scrollToTabs() {
    document.getElementById("tabs")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onShowProject={() => setTab("project")} onShowProduct={() => setTab("commercial")} onScrollToTabs={scrollToTabs} />
      <Hero />
      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 pb-20 sm:gap-16">
        <div id="tabs" className="scroll-mt-24">
          <Tabs value={tab} onChange={setTab} />
        </div>
        <section className="animate-fade-in">
          {tab === "commercial" ? <CommercialPanel /> : <ProjectPanel />}
        </section>
      </main>
      <Footer />
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar({
  onShowProject,
  onShowProduct,
  onScrollToTabs,
}: {
  onShowProject: () => void;
  onShowProduct: () => void;
  onScrollToTabs: () => void;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2 text-h3 font-semibold tracking-tight text-foreground">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            Y
          </span>
          Yantar
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink
            onClick={() => {
              onShowProduct();
              onScrollToTabs();
            }}
          >
            Producto
          </NavLink>
          <NavLink
            onClick={() => {
              onShowProject();
              onScrollToTabs();
            }}
          >
            Proyecto
          </NavLink>
          <Link
            href="/demo"
            className="rounded-md px-3 py-1.5 text-body-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Demo
          </Link>
        </div>

        <Link
          href="/register-business"
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-4 text-body-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Crear cuenta
          <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
}

function NavLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md px-3 py-1.5 text-body-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {children}
    </button>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-border/60">
      {/* Decoración de fondo: dos blobs suaves con el primary */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-32 top-32 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Columna texto */}
        <div className="space-y-6 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1 text-caption uppercase tracking-wider text-muted-foreground backdrop-blur">
            <Sparkles size={12} className="text-primary" />
            Sin comisiones · Tu marca · En minutos
          </span>

          <h1 className="text-display leading-[1.05] sm:text-[3.5rem]">
            El canal de pedidos
            <br />
            que <span className="text-primary">vuelve a ser tuyo</span>.
          </h1>

          <p className="max-w-xl text-body text-muted-foreground sm:text-h3 sm:leading-snug sm:text-muted-foreground">
            Yantar pone tu restaurante online en minutos: tu URL, tu marca, tu
            cliente. Una plataforma SaaS pensada para que recuperes el control
            sobre tu canal digital.
          </p>

          <div className="flex flex-col items-start gap-3 pt-1 sm:flex-row sm:items-center">
            <Link
              href="/register-business"
              className="inline-flex h-11 items-center justify-center gap-1 rounded-md bg-primary px-6 text-body font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0"
            >
              Crear cuenta gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-11 items-center justify-center gap-1 rounded-md border border-border bg-surface px-6 text-body font-medium text-foreground transition hover:bg-secondary"
            >
              Ver demo guiada
              <ChevronRight size={16} />
            </Link>
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-caption text-muted-foreground">
            <li className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-success" /> Sin tarjeta
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-success" /> Sin compromiso
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-success" /> Listo el mismo día
            </li>
          </ul>
        </div>

        {/* Columna mockup */}
        <div className="animate-fade-in-up [animation-delay:120ms]">
          <BrowserMockup />
        </div>
      </div>
    </header>
  );
}

/**
 * Mockup CSS de la app del comensal renderizada dentro de una ventana del
 * navegador. No depende de capturas reales: las "tarjetas de plato" son divs
 * estilizados con datos del seed de demo (Pizzería Nápoli).
 */
function BrowserMockup() {
  return (
    <div className="relative mx-auto max-w-md rotate-[0.5deg] rounded-xl border border-border bg-surface shadow-2xl shadow-primary/10 transition-transform hover:rotate-0">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-border bg-background/60 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" aria-hidden />
        <div className="ml-2 flex-1 truncate rounded-md bg-secondary px-2 py-0.5 text-caption text-muted-foreground">
          napoli.yantar.app/centro
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 p-3">
        {/* Header del restaurante */}
        <div className="flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-primary-foreground">
          <span className="text-body-sm font-semibold">Pizzería Nápoli</span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider">
            Sede Centro
          </span>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-1.5">
          <Pill>Todas</Pill>
          <Pill active>Sin gluten</Pill>
          <Pill>Sin lácteos</Pill>
        </div>

        {/* Platos */}
        <DishRow name="Margherita" desc="Tomate, mozzarella, albahaca" price="10,50 €" />
        <DishRow name="Pepperoni" desc="Pepperoni picante, mozzarella" price="12,50 €" />
        <DishRow name="Quattro Formaggi" desc="Mozzarella, gorgonzola, parmesano, ricotta" price="13,50 €" />

        {/* CTA bottom */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
          <span className="text-caption text-muted-foreground">2 platos · 23,00 €</span>
          <span className="rounded-md bg-primary px-3 py-1 text-caption font-medium text-primary-foreground">
            Pagar
          </span>
        </div>
      </div>
    </div>
  );
}

function Pill({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full border px-2 py-0.5 text-[10px]",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function DishRow({
  name,
  desc,
  price,
}: {
  name: string;
  desc: string;
  price: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5">
      <div className="h-10 w-10 shrink-0 rounded-md bg-gradient-to-br from-primary/20 to-accent/30" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-sm font-medium text-foreground">{name}</p>
        <p className="truncate text-caption text-muted-foreground">{desc}</p>
      </div>
      <span className="text-body-sm font-semibold tabular-nums text-foreground">{price}</span>
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

function Tabs({
  value,
  onChange,
}: {
  value: "commercial" | "project";
  onChange: (v: "commercial" | "project") => void;
}) {
  return (
    <div role="tablist" className="mx-auto flex w-full max-w-md gap-1 rounded-full border border-border bg-surface p-1">
      <TabButton
        active={value === "commercial"}
        onClick={() => onChange("commercial")}
        icon={<Store size={14} />}
        label="Para tu restaurante"
      />
      <TabButton
        active={value === "project"}
        onClick={() => onChange("project")}
        icon={<GraduationCap size={14} />}
        label="Sobre el proyecto"
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-body-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Panel comercial ─────────────────────────────────────────────────────────

function CommercialPanel() {
  return (
    <div className="space-y-16">
      {/* Propuesta de valor — los tres ejes del TFG */}
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Propuesta de valor"
          title="Tres ejes que devuelven el control a tu restaurante"
          body="Yantar combina autonomía estratégica, sostenibilidad económica y eficiencia tecnológica para que pidas online sin renunciar al control de tu negocio."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <ValueProp
            icon={<Sparkles size={20} />}
            title="Autonomía estratégica"
            body="Tu marca al frente, tu relación directa con el cliente, tus datos."
            bullets={[
              "White-label completo: logotipo, paleta de 7 colores y tipografía propia.",
              "Dominio propio o subdominio gratuito bajo yantar.app.",
              "Datos de tus clientes en tu poder, no compartidos con intermediarios.",
              "Programa de fidelización configurable basado en tu propia base de clientes.",
            ]}
          />
          <ValueProp
            icon={<Wallet size={20} />}
            title="Sostenibilidad económica"
            body="Cuota mensual fija que sustituye a las comisiones variables del 15-30 % de los agregadores."
            bullets={[
              "0 % de comisión sobre cada pedido: el ticket entero es tuyo.",
              "Coste predecible mes a mes, sin sorpresas en función del volumen.",
              "Margen operativo preservado, especialmente en pedidos de bajo importe.",
              "Coste marginal estimado en torno a 2 €/mes por tenant en infraestructura.",
            ]}
          />
          <ValueProp
            icon={<Zap size={20} />}
            title="Eficiencia tecnológica"
            body="SaaS multi-tenant en la nube. Sin servidor propio, sin instaladores, sin equipo técnico."
            bullets={[
              "Alta self-service en minutos: te registras y ya tienes tu URL operativa.",
              "Carta, sedes, horarios, zonas de reparto y branding sin tocar código.",
              "Actualizaciones y mantenimiento centralizados, sin downtime para ti.",
              "Tres vistas listas: comensal mobile-first, panel admin y kanban operativo.",
            ]}
          />
        </div>
      </section>

      {/* Las tres vistas */}
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Tres vistas, una plataforma"
          title="Pensado para los tres roles del restaurante"
          body="Comensal, restaurador y operario. Cada uno tiene su interfaz, optimizada para el dispositivo donde la usa."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <ViewCard
            icon={<Smartphone size={20} />}
            title="App del comensal"
            device="Móvil"
            body="Carta digital con variantes y modificadores, filtros por alérgenos, carrito persistente, seguimiento del pedido en tiempo real."
          />
          <ViewCard
            icon={<LayoutDashboard size={20} />}
            title="Panel del restaurador"
            device="Escritorio"
            body="Gestión de carta, sucursales, horarios, zonas de reparto sobre mapa, branding y programa de fidelización."
          />
          <ViewCard
            icon={<KanbanSquare size={20} />}
            title="Vista operativa"
            device="Tablet"
            body="Kanban de pedidos en tiempo real para cocina y barra. Pedidos nuevos sin recargar, vía WebSocket."
          />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Tres pasos hasta tu primera venta"
        />
        <ol className="grid gap-4 sm:grid-cols-3">
          <Step
            n={1}
            title="Te registras"
            body="Email y contraseña. En el momento tienes tu URL personal: tu-restaurante.yantar.app."
          />
          <Step
            n={2}
            title="Configuras tu restaurante"
            body="Sedes, horarios, zonas de reparto y carta. Logo y colores con preview en vivo."
          />
          <Step
            n={3}
            title="Compartes la URL"
            body="QR en mesa, redes sociales, web propia. Tus clientes piden directamente."
          />
        </ol>
      </section>

      {/* CTA final */}
      <section className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
        <h2 className="text-h2 text-foreground">
          ¿Listo para tener tu propio canal?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-body text-muted-foreground">
          Crea tu cuenta y empieza a recibir pedidos hoy. Sin tarjeta, sin
          compromiso, sin instaladores.
        </p>
        <Link
          href="/register-business"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-body font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Crear cuenta gratis
        </Link>
      </section>
    </div>
  );
}

// ─── Panel del proyecto (académico) ──────────────────────────────────────────

function ProjectPanel() {
  return (
    <div className="space-y-12">
      <header className="space-y-3 text-center sm:text-left">
        <p className="text-caption uppercase tracking-wider text-muted-foreground">
          Trabajo de Fin de Grado
        </p>
        <h2 className="text-h1 text-foreground">
          Yantar: SaaS multi-tenant para restaurantes
        </h2>
        <p className="text-body text-muted-foreground">
          Trabajo de Fin de Grado en Ingeniería Informática — Tecnologías
          Informáticas, Universidad de Sevilla, curso 2025-2026.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard
          title="Equipo"
          rows={[
            { label: "Autores", value: "Liberto Romero, Ángel Caravaca" },
            { label: "Tutor", value: "Sergio Segura Rueda" },
            { label: "Departamento", value: "Lenguajes y Sistemas Informáticos" },
          ]}
        />
        <InfoCard
          title="Cifras del proyecto"
          rows={[
            { label: "Tests automatizados", value: "341 backend + 68 frontend" },
            { label: "Bounded contexts", value: "6 (Identity, Company, Menu, Allergen, Order, Loyalty)" },
            { label: "Sprints completados", value: "18" },
          ]}
        />
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Stack tecnológico"
          title="Construido con TypeScript de extremo a extremo"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StackPill area="Backend" tech="NestJS 10 + TypeScript" />
          <StackPill area="ORM" tech="Prisma + PostgreSQL 16" />
          <StackPill area="Auth" tech="JWT + bcrypt" />
          <StackPill area="Frontend" tech="Next.js 14 (App Router)" />
          <StackPill area="UI" tech="Tailwind CSS + componentes propios" />
          <StackPill area="Estado servidor" tech="React Query (TanStack)" />
          <StackPill area="Tiempo real" tech="Socket.io / WebSocket" />
          <StackPill area="Mapas" tech="Leaflet + leaflet-draw" />
          <StackPill area="Testing" tech="Jest (back) + Vitest (front)" />
          <StackPill area="Monorepo" tech="pnpm workspaces + Turborepo" />
          <StackPill area="DB local" tech="Docker Compose" />
          <StackPill area="Despliegue" tech="Vercel + DB gestionada" />
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Decisiones de diseño"
          title="Lo que hace Yantar interesante como TFG"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DesignNote
            title="Arquitectura hexagonal estricta"
            body="Cada bounded context se separa en capas domain → application → infrastructure. Las dependencias cross-domain se resuelven a través de ports, no de imports directos."
          />
          <DesignNote
            title="Multi-tenant por slug runtime"
            body="Una única instancia atiende a todos los restaurantes. El middleware Next.js extrae el slug del Host (subdominio Yantar o dominio propio) y lo inyecta como header interno; sin builds por tenant."
          />
          <DesignNote
            title="Aislamiento defensivo en tres niveles"
            body="Cada recurso lleva companyId verificado en API, repositorio y autorización. Imposible que una empresa lea datos de otra por error."
          />
          <DesignNote
            title="TDD pragmático"
            body="Las capas domain y application se construyen test-first. La infraestructura se cubre en e2e. Cobertura objetivo: cero servicios sin tests de happy path y de error."
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-body text-muted-foreground">
          Repositorio, memoria del TFG y diagramas se publicarán al cierre del
          proyecto. Esta web es la implementación de referencia.
        </p>
      </section>
    </div>
  );
}

// ─── Building blocks ─────────────────────────────────────────────────────────

function ValueProp({
  icon,
  title,
  body,
  bullets,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  bullets?: string[];
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="text-h2 text-foreground">{title}</h3>
      <p className="mt-2 text-body-sm text-muted-foreground">{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-border pt-4">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-body-sm">
              <Check size={14} className="mt-1 shrink-0 text-success" aria-hidden />
              <span className="text-foreground">{b}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function ViewCard({
  icon,
  title,
  device,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  device: string;
  body: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </span>
        <span className="text-caption uppercase tracking-wider text-muted-foreground">
          {device}
        </span>
      </div>
      <h3 className="text-h3 text-foreground">{title}</h3>
      <p className="mt-1 text-body-sm text-muted-foreground">{body}</p>
    </article>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-body-sm font-semibold text-primary-foreground">
        {n}
      </span>
      <h3 className="mt-3 text-h3 text-foreground">{title}</h3>
      <p className="mt-1 text-body-sm text-muted-foreground">{body}</p>
    </li>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="space-y-2 text-center sm:text-left">
      {eyebrow && (
        <p className="text-caption uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="text-h2 text-foreground">{title}</h2>
      {body && (
        <p className="mx-auto max-w-2xl text-body text-muted-foreground sm:mx-0">
          {body}
        </p>
      )}
    </div>
  );
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="text-h3 text-foreground">{title}</h3>
      <dl className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5 text-body-sm sm:flex-row sm:gap-4">
            <dt className="min-w-[9rem] text-muted-foreground">{r.label}</dt>
            <dd className="text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function StackPill({ area, tech }: { area: string; tech: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-body-sm">
      <span className="text-muted-foreground">{area}</span>
      <span className="font-medium text-foreground">{tech}</span>
    </div>
  );
}

function DesignNote({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Code2 size={16} />
      </span>
      <h3 className="text-h3 text-foreground">{title}</h3>
      <p className="mt-1 text-body-sm text-muted-foreground">{body}</p>
    </article>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-caption text-muted-foreground sm:flex-row">
        <p>© 2026 Yantar — TFG Universidad de Sevilla.</p>
        <p className="flex items-center gap-1.5">
          <Bike size={12} className="text-primary" />
          Hecho para restaurantes que no quieren intermediarios.
        </p>
      </div>
    </footer>
  );
}
