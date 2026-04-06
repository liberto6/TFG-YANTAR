# Yantar

Plataforma SaaS white-label de delivery para restaurantes. Cada empresa obtiene su propia web-app de pedidos personalizada (logo, colores, dominio propio) lista para usar. Yantar opera como infraestructura invisible.

## Stack Tecnologico

| Componente | Tecnologia |
|------------|-----------|
| Backend | NestJS (TypeScript) + Prisma + PostgreSQL |
| Frontend | Next.js 14 (App Router, TypeScript) |
| Auth | Supabase Auth (JWT) |
| Tiempo real | WebSockets (NestJS Gateway) |
| UI | shadcn/ui + Tailwind CSS |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Jest + React Testing Library |

## Funcionalidades principales

- **Pedidos online** — carta digital, personalizacion de platos (variantes + modificadores), delivery y pickup
- **Multi-sede** — una empresa puede tener varias sedes con horarios y zonas de reparto independientes
- **Alergenos** — informacion por plato con filtrado por intolerancias (14 alergenos EU)
- **Fidelizacion** — puntos por pedido, canje por descuentos, reglas configurables por empresa
- **Vista operativa** — panel para cocina/barra con pedidos en tiempo real (tablet-friendly)
- **White-label total** — dominio propio, branding propio, Yantar invisible

## Estructura del monorepo

```
apps/
  backend/          NestJS API (arquitectura hexagonal)
  web/              Next.js (customer + admin + operativo)
packages/
  shared/           Tipos y enums compartidos
yantar-skills-dev/  Skills de desarrollo (documentacion viva)
```

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Levantar PostgreSQL
docker compose up -d

# Migrar base de datos
pnpm --filter @yantar/backend prisma:migrate

# Desarrollo
pnpm dev
```
