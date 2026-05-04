"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";
import {
  ArrowRight,
  Bike,
  Check,
  ChevronRight,
  Code2,
  GraduationCap,
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
    <header className="relative overflow-hidden border-b border-border/60 noise">
      {/* Mesh gradient animado de fondo: rotación lenta + blur */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="mesh-bg" />
      </div>

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        {/* Columna texto */}
        <div className="space-y-6 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1 text-caption uppercase tracking-wider text-muted-foreground backdrop-blur">
            <Sparkles size={12} className="text-primary" />
            Sin comisiones · Tu marca · En minutos
          </span>

          <h1 className="text-display">
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
              className="shine-on-hover inline-flex h-11 items-center justify-center gap-1 rounded-md bg-primary px-6 text-body font-medium text-primary-foreground shadow-primary-glow transition hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-primary-glow-lg active:translate-y-0"
            >
              Crear cuenta gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-11 items-center justify-center gap-1 rounded-md border border-border bg-surface/80 px-6 text-body font-medium text-foreground backdrop-blur transition hover:bg-secondary"
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
      {/* Propuesta de valor — bento grid asimétrico */}
      <Reveal>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Propuesta de valor"
            title="Tres ejes que devuelven el control a tu restaurante"
            body="Yantar combina autonomía estratégica, sostenibilidad económica y eficiencia tecnológica para que pidas online sin renunciar al control de tu negocio."
          />

          {/* Bento: 1 pieza grande (autonomía) + 2 piezas a la derecha apiladas */}
          <div className="grid gap-3 lg:grid-cols-3 lg:auto-rows-[1fr]">
            <BentoTile
              className="lg:col-span-2 lg:row-span-2"
              tone="primary"
              icon={<Sparkles size={20} />}
              title="Autonomía estratégica"
              body="Tu marca al frente, tu relación directa con el cliente, tus datos."
              bullets={[
                "White-label completo: logotipo, paleta de 7 colores y tipografía propia.",
                "Dominio propio o subdominio gratuito bajo yantar.app.",
                "Datos de tus clientes en tu poder, no compartidos con intermediarios.",
                "Programa de fidelización configurable basado en tu propia base de clientes.",
              ]}
              decoration={<BrandPaletteVisual />}
            />
            <BentoTile
              tone="default"
              icon={<Wallet size={20} />}
              title="Sostenibilidad económica"
              body="Cuota mensual fija que sustituye al 15-30 % de comisión por pedido de los agregadores."
              metric={{ value: "0 %", label: "comisión por pedido" }}
            />
            <BentoTile
              tone="default"
              icon={<Zap size={20} />}
              title="Eficiencia tecnológica"
              body="SaaS multi-tenant en la nube. Sin servidor propio, sin instaladores, sin equipo técnico."
              metric={{ value: "< 60 s", label: "del registro a tu URL" }}
            />
          </div>
        </section>
      </Reveal>

      {/* Las tres vistas */}
      <Reveal>
        <section className="space-y-6">
        <SectionHeading
          eyebrow="Tres vistas, una plataforma"
          title="Pensado para los tres roles del restaurante"
          body="Comensal, restaurador y operario. Cada uno tiene su interfaz, optimizada para el dispositivo donde la usa."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <DeviceCard
            device="phone"
            title="App del comensal"
            tagline="Móvil"
            body="Carta digital con variantes y modificadores, filtros por alérgenos, carrito persistente, seguimiento del pedido en tiempo real."
          >
            <PhoneScreen />
          </DeviceCard>
          <DeviceCard
            device="laptop"
            title="Panel del restaurador"
            tagline="Escritorio"
            body="Gestión de carta, sucursales, horarios, zonas de reparto sobre mapa, branding y programa de fidelización."
          >
            <LaptopScreen />
          </DeviceCard>
          <DeviceCard
            device="tablet"
            title="Vista operativa"
            tagline="Tablet"
            body="Kanban de pedidos en tiempo real para cocina y barra. Pedidos nuevos sin recargar, vía WebSocket."
          >
            <TabletScreen />
          </DeviceCard>
        </div>
        </section>
      </Reveal>

      {/* Cómo funciona — sticky scroll storytelling */}
      <Reveal>
        <HowItWorksStory />
      </Reveal>

      {/* CTA final cinematográfico (P8): tipografía gigante, gradiente animado */}
      <Reveal>
        <section className="relative overflow-hidden rounded-2xl border border-border bg-foreground p-10 text-center sm:p-16 noise">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="mesh-bg opacity-50" />
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-display text-background">
              Empieza hoy.
            </h2>
            <p className="mx-auto max-w-xl text-body text-background/70">
              Sin tarjeta, sin compromiso, sin instaladores. Tu URL operativa
              en menos de un minuto.
            </p>
            <Link
              href="/register-business"
              className="shine-on-hover inline-flex h-12 items-center justify-center gap-1 rounded-md bg-primary px-8 text-body font-medium text-primary-foreground shadow-primary-glow-lg transition hover:-translate-y-0.5 hover:bg-primary/95"
            >
              Crear cuenta gratis
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </Reveal>
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

/**
 * Sección "Cómo funciona" como scroll-driven storytelling: el visual se queda
 * pegado a la izquierda mientras el usuario scrollea por los 3 pasos a la
 * derecha. Cada paso, al entrar en el viewport, activa una ilustración
 * distinta. Patrón inspirado en stripe.com/atlas y linear.app/method.
 */
function HowItWorksStory() {
  const STEPS = [
    {
      n: 1,
      title: "Te registras",
      body: "Email y contraseña. En el momento tienes tu URL personal: tu-restaurante.yantar.app.",
    },
    {
      n: 2,
      title: "Configuras tu restaurante",
      body: "Sedes, horarios, zonas de reparto y carta. Logo y colores con preview en vivo.",
    },
    {
      n: 3,
      title: "Compartes la URL",
      body: "QR en mesa, redes sociales, web propia. Tus clientes piden directamente.",
    },
  ];

  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number(visible.target.getAttribute("data-step-idx") ?? "0");
        setActive(idx);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.5, 1] },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Cómo funciona"
        title="Tres pasos hasta tu primera venta"
      />
      <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Panel sticky con el visual */}
        <div className="lg:sticky lg:top-24 lg:h-[420px]">
          <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-surface">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
            >
              <div className="mesh-bg" />
            </div>
            <div className="relative z-10 flex h-full items-center justify-center p-6">
              {active === 0 && <StoryStep1 />}
              {active === 1 && <StoryStep2 />}
              {active === 2 && <StoryStep3 />}
            </div>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all duration-300",
                    i === active ? "w-6 bg-primary" : "w-1.5 bg-border",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Columna scrolleable de pasos */}
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-step-idx={i}
              className={[
                "rounded-2xl border bg-surface p-6 transition-all duration-500 ease-out-expo",
                active === i
                  ? "border-primary/40 shadow-primary-glow"
                  : "border-border opacity-70",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-full text-body-sm font-semibold transition-colors",
                  active === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {s.n}
              </span>
              <h3 className="mt-4 text-h2 text-foreground">{s.title}</h3>
              <p className="mt-2 text-body text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function StoryStep1() {
  return (
    <div className="w-full max-w-xs animate-fade-in space-y-3 rounded-xl border border-border bg-background p-4 shadow-md">
      <p className="text-caption uppercase tracking-wider text-muted-foreground">
        yantar.app/register-business
      </p>
      <div className="space-y-2">
        <Field label="Restaurante" value="Pizzería Nápoli" />
        <Field label="Email" value="ana@napoli.es" />
        <Field label="Contraseña" value="•••••••••" />
      </div>
      <div className="rounded-md bg-primary px-3 py-2 text-center text-body-sm font-medium text-primary-foreground shadow-primary-glow">
        Crear restaurante
      </div>
    </div>
  );
}

function StoryStep2() {
  return (
    <div className="w-full max-w-sm animate-fade-in space-y-3">
      <div className="rounded-xl border border-border bg-background p-3">
        <p className="text-caption uppercase tracking-wider text-muted-foreground">
          Branding
        </p>
        <div className="mt-2 flex gap-1.5">
          {["#c0392b", "#e67e22", "#f39c12", "#16a085", "#2980b9", "#8e44ad", "#2c3e50"].map((c) => (
            <span key={c} className="h-7 w-7 rounded-md border border-white/30 shadow-sm" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-background p-3">
        <p className="text-caption uppercase tracking-wider text-muted-foreground">
          Carta
        </p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-border"
              style={{
                background: i % 2 === 0 ? "linear-gradient(135deg,#c0392b22,#e67e2244)" : "transparent",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryStep3() {
  return (
    <div className="flex w-full max-w-sm animate-fade-in flex-col items-center gap-4">
      <div className="rounded-xl border border-border bg-background p-4 text-center shadow-md">
        <p className="text-caption uppercase tracking-wider text-muted-foreground">
          Tu URL pública
        </p>
        <p className="mt-1 break-all font-mono text-h3 text-primary">
          napoli.yantar.app
        </p>
      </div>
      <div className="flex items-center justify-center rounded-xl border border-border bg-background p-3">
        <div
          className="grid h-32 w-32 grid-cols-8 grid-rows-8 gap-px"
          aria-hidden
        >
          {Array.from({ length: 64 }).map((_, i) => (
            <span
              key={i}
              className={
                Math.random() > 0.45
                  ? "bg-foreground"
                  : "bg-background"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-caption text-muted-foreground">{label}</p>
      <div className="rounded-md border border-border bg-surface px-2 py-1 text-body-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

/**
 * Tile del bento grid de propuesta de valor. Soporta tres variantes:
 *  - tone="primary": fondo tintado, sombra a color, suele ser la pieza grande.
 *  - tone="default": fondo neutro de surface.
 *  - decoration: SVG / componente decorativo opcional para piezas grandes.
 *  - metric: bloque numérico grande para piezas pequeñas (mostly KPI).
 */
function BentoTile({
  className = "",
  tone = "default",
  icon,
  title,
  body,
  bullets,
  metric,
  decoration,
}: {
  className?: string;
  tone?: "primary" | "default";
  icon: React.ReactNode;
  title: string;
  body: string;
  bullets?: string[];
  metric?: { value: string; label: string };
  decoration?: React.ReactNode;
}) {
  const isPrimary = tone === "primary";
  return (
    <article
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-300 ease-out-expo hover:-translate-y-0.5",
        isPrimary
          ? "border-primary/30 bg-gradient-to-br from-primary/8 via-surface to-accent/5 shadow-primary-glow hover:shadow-primary-glow-lg"
          : "border-border bg-surface hover:border-primary/40 hover:shadow-lg",
        className,
      ].join(" ")}
    >
      {decoration && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-90"
        >
          {decoration}
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <span
          className={[
            "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110",
            isPrimary
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-primary/10 text-primary",
          ].join(" ")}
        >
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

        {metric && (
          <div className="mt-auto pt-6">
            <p className="font-mono text-[2.25rem] font-semibold leading-none tracking-tight text-foreground">
              {metric.value}
            </p>
            <p className="mt-1 text-caption uppercase tracking-wider text-muted-foreground">
              {metric.label}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Visual decorativo para la tile de "Autonomía estratégica": una paleta de
 * 7 colores flotando sutil en la esquina inferior derecha. Refuerza el
 * mensaje de white-label con paleta personalizable.
 */
function BrandPaletteVisual() {
  const palette = [
    "#c0392b",
    "#e67e22",
    "#f39c12",
    "#16a085",
    "#2980b9",
    "#8e44ad",
    "#2c3e50",
  ];
  return (
    <div className="absolute -bottom-6 -right-6 grid grid-cols-4 gap-2 opacity-60 transition-opacity duration-500 group-hover:opacity-90">
      {palette.map((c, i) => (
        <span
          key={c}
          className="h-12 w-12 rounded-xl border border-white/30 shadow-md transition-transform duration-500"
          style={{
            background: c,
            transform: `translateY(${(i % 2) * -8}px) rotate(${(i - 3) * 4}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Card de "vista" con marco de dispositivo (móvil, portátil o tablet) en
 * lugar de un icono. Cada marco contiene una réplica simplificada de la
 * pantalla principal de ese rol.
 */
function DeviceCard({
  device,
  title,
  tagline,
  body,
  children,
}: {
  device: "phone" | "laptop" | "tablet";
  title: string;
  tagline: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-all duration-300 ease-out-expo hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div className="mb-5 flex items-center justify-center">
        {device === "phone" && <PhoneFrame>{children}</PhoneFrame>}
        {device === "laptop" && <LaptopFrame>{children}</LaptopFrame>}
        {device === "tablet" && <TabletFrame>{children}</TabletFrame>}
      </div>
      <span className="text-caption uppercase tracking-wider text-muted-foreground">
        {tagline}
      </span>
      <h3 className="mt-1 text-h3 text-foreground">{title}</h3>
      <p className="mt-1 text-body-sm text-muted-foreground">{body}</p>
    </article>
  );
}

// ─── Marcos de dispositivo (CSS only) ────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[260px] w-[140px] rounded-[28px] border-[3px] border-foreground/85 bg-foreground/85 p-[3px] shadow-xl shadow-primary/10 transition-transform duration-500 group-hover:scale-105">
      <span className="absolute left-1/2 top-1.5 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-foreground" />
      <div className="h-full w-full overflow-hidden rounded-[24px] bg-background">
        {children}
      </div>
    </div>
  );
}

function LaptopFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition-transform duration-500 group-hover:scale-105">
      <div className="rounded-t-lg border-[3px] border-b-0 border-foreground/85 bg-foreground/85 p-[3px]">
        <div className="aspect-[16/10] w-[230px] overflow-hidden rounded-t-md bg-background">
          {children}
        </div>
      </div>
      <div className="relative -mx-2 h-2 rounded-b-md bg-foreground/85">
        <span className="absolute left-1/2 top-0 h-1 w-12 -translate-x-1/2 rounded-b-md bg-foreground" />
      </div>
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border-[3px] border-foreground/85 bg-foreground/85 p-[3px] shadow-xl shadow-primary/10 transition-transform duration-500 group-hover:scale-105">
      <div className="aspect-[4/3] w-[230px] overflow-hidden rounded-xl bg-background">
        {children}
      </div>
    </div>
  );
}

// ─── Pantallas dentro de cada marco (réplicas mini de la app real) ──────────

function PhoneScreen() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between bg-primary px-2 py-1.5 text-[8px] font-semibold text-primary-foreground">
        <span>Pizzería Nápoli</span>
        <span className="rounded-full bg-white/20 px-1 py-px text-[6px] uppercase">
          Centro
        </span>
      </div>
      <div className="flex gap-1 border-b border-border px-2 py-1">
        {["Pizzas", "Pasta", "Postres"].map((c, i) => (
          <span
            key={c}
            className={[
              "rounded-full px-1.5 py-px text-[7px]",
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            ].join(" ")}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="flex-1 space-y-1.5 p-2">
        {["Margherita", "Pepperoni", "Quattro"].map((d, i) => (
          <div
            key={d}
            className="flex items-center gap-1.5 rounded-md border border-border p-1.5"
          >
            <div
              className="h-7 w-7 shrink-0 rounded"
              style={{
                background: "linear-gradient(135deg,#c0392b33,#e67e2255)",
              }}
            />
            <div className="flex-1 text-[8px]">
              <p className="font-medium text-foreground">{d}</p>
              <p className="text-[6px] text-muted-foreground">
                {(10.5 + i).toFixed(2)} €
              </p>
            </div>
            <span className="rounded-full bg-primary px-1 py-px text-[6px] text-primary-foreground">
              +
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LaptopScreen() {
  return (
    <div className="flex h-full">
      <div className="w-[55px] shrink-0 border-r border-border bg-surface p-1.5">
        <p className="mb-1 text-[6px] uppercase tracking-wider text-muted-foreground">
          Admin
        </p>
        {[
          { label: "Dashboard", active: false },
          { label: "Carta", active: true },
          { label: "Sedes", active: false },
          { label: "Marca", active: false },
        ].map((it) => (
          <p
            key={it.label}
            className={[
              "rounded px-1 py-0.5 text-[7px]",
              it.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground",
            ].join(" ")}
          >
            {it.label}
          </p>
        ))}
      </div>
      <div className="flex-1 space-y-1.5 p-2">
        <p className="text-[9px] font-semibold text-foreground">Carta</p>
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-square rounded border border-border bg-secondary"
              style={{
                background: i % 2 === 0
                  ? "linear-gradient(135deg,#c0392b22,#e67e2244)"
                  : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TabletScreen() {
  const cols = ["Pendiente", "Aceptado", "Preparando", "Listo"];
  return (
    <div className="flex h-full flex-col p-1.5">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[7px] font-semibold text-foreground">
          Pedidos en curso
        </p>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-1 py-px text-[6px] text-success">
          ● Live
        </span>
      </div>
      <div className="grid flex-1 grid-cols-4 gap-1">
        {cols.map((c, i) => (
          <div
            key={c}
            className={[
              "flex flex-col gap-1 rounded border bg-secondary/50 p-1",
              i === 0 ? "border-primary bg-primary/5" : "border-border",
            ].join(" ")}
          >
            <p className="text-[6px] font-medium uppercase tracking-wider text-muted-foreground">
              {c}
            </p>
            {i === 0 && (
              <div className="rounded bg-background p-1 shadow-sm">
                <p className="text-[7px] font-semibold">#1042</p>
                <p className="text-[6px] text-muted-foreground">2× pizza</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
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
