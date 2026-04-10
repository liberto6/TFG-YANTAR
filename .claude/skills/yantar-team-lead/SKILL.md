---
name: yantar-team-lead
description: >
  Orquestador principal para cualquier feature, bugfix o refactor en Yantar.
  Aplica TDD pragmatico, arquitectura hexagonal sobre NestJS, feature-based frontend,
  y review de acoplamiento por feature.
triggers:
  - Cualquier feature, bugfix o refactor en el proyecto Yantar
---

# Yantar Team Lead

## Vision General

Yantar es una plataforma SaaS white-label de delivery que permite a restaurantes tener su propia web-app de pedidos personalizada. El proyecto es un monorepo TypeScript con:

- **Backend**: NestJS + Prisma + PostgreSQL en `apps/backend/`
- **Frontend**: Next.js (App Router) en `apps/web/`
- **Shared**: Tipos compartidos en `packages/shared/`

### Dominios del Sistema

| Bounded Context | Modulo Backend | Vista Frontend | Descripcion |
|----------------|---------------|----------------|-------------|
| Identity | `src/identity/` | `(auth)/` | Usuarios, auth, roles RBAC |
| Company | `src/company/` | `(admin)/` | Empresas, sedes, branding, horarios, zonas |
| Menu | `src/menu/` | `(admin)/` + `(customer)/` | Carta, platos, categorias, variantes, modificadores |
| Allergen | `src/allergen/` | `(customer)/` integrado en menu | Alergenos, filtros, tags dieteticos |
| Order | `src/order/` | `(customer)/` + `(operativo)/` | Carrito, pedidos, lifecycle, tiempo real |
| Loyalty | `src/loyalty/` | `(customer)/` + `(admin)/` | Puntos, recompensas, reglas configurables |

---

## Protocolo Obligatorio

### 1. Identificar Dominios Afectados

Antes de escribir codigo, identifica que bounded contexts toca la feature.
Consulta el skill de dominio correspondiente:

**Backend:**
- `/yantar-domain-identity` — Auth, perfiles, roles (CUSTOMER/RESTAURANT_ADMIN/SUPERADMIN)
- `/yantar-domain-company` — Empresa, sedes, branding, horarios, zonas de reparto
- `/yantar-domain-menu` — Platos, categorias, variantes, modificadores, precios
- `/yantar-domain-allergen` — Alergenos, ingredientes, filtros alimentarios
- `/yantar-domain-order` — Carrito, pedidos, estados, modalidades, tiempo real
- `/yantar-domain-loyalty` — Puntos, canjes, reglas de fidelizacion

**Frontend:**
- `/yantar-frontend-customer` — Web-app de pedidos (carta, carrito, checkout, estado)
- `/yantar-frontend-admin` — Panel admin (carta, branding, sedes, config)
- `/yantar-frontend-operativo` — Vista operativa (pedidos en tiempo real, tablet)
- `/yantar-frontend-identity` — Auth compartido (login, registro, perfil)

### 2. TDD Pragmatico

Seguir el protocolo en `references/tdd-workflow.md`:

**TDD estricto (obligatorio):**
- Domain layer: entities, value objects, domain services
- Application layer: use cases / services

**Tests de integracion (no TDD estricto):**
- Controllers / endpoints (e2e)
- Frontend: componentes clave

**Ciclo:**
1. Escribir test → confirmar que FALLA
2. Implementar capa por capa: domain → application → infrastructure
3. Ejecutar test → confirmar que PASA
4. Refactorizar
5. Ejecutar tests de fitness arquitectonica

### 3. Reglas Arquitectonicas

Seguir las reglas en `references/architecture-rules.md`:
- Domain y Application layers NO importan frameworks (NestJS, Prisma)
- Cross-domain solo a traves de ports (interfaces)
- Infrastructure: controllers (REST) + repositories (Prisma) + gateways (WebSocket)
- Frontend: feature-based, App Router con route groups

### 3.1 Use Cases (Capa Application)

Seguir los patrones en `references/use-case-patterns.md`:
- Un servicio NestJS por use case — nombre: `{Verb}{Noun}Service`
- Constructor recibe ports (interfaces) via DI de NestJS
- DTOs de Request/Response con class-validator
- Errores de dominio, nunca HttpException

### 4. Al Completar un Sprint

Al terminar cada sprint:

1. **Actualizar README.md** con una nueva sección `### Sprint N — Título ✅` que documente:
   - Objetivo del sprint
   - Archivos/componentes implementados
   - Tests añadidos (tabla suite → nº tests → qué cubre)
   - Cobertura total actualizada (backend + frontend)

2. **Crear un commit local** con todos los cambios del sprint.

3. **NO hacer push a GitHub** salvo que el usuario lo pida explícitamente.

> Regla: `git commit` sí, `git push` nunca por defecto.

### 5. Principios White-Label

Toda feature debe respetar:
- **El cliente final NUNCA ve la marca Yantar** — todo branding viene de la empresa
- **Configurabilidad** — colores, logos, textos configurables por empresa
- **Multi-tenancy** — cada empresa tiene datos aislados (company_id obligatorio)
- **Mobile-first** — toda UI del customer se optimiza para movil
- **Dominio propio** — cada empresa usa su propio dominio

---

## Gestion de Skills de Dominio

Los skills de dominio son **documentacion viva**. Al implementar una feature que modifique la estructura de un dominio:

1. Actualizar el SKILL.md del dominio afectado
2. Agregar nuevos ports, entidades o use cases a la documentacion
3. Registrar deuda tecnica encontrada
