# Yantar

Plataforma SaaS white-label de delivery para restaurantes. Cada empresa obtiene su propia web-app de pedidos personalizada (logo, colores, dominio propio) lista para usar. Yantar opera como infraestructura invisible.

## Stack Tecnologico

| Componente | Tecnologia |
|------------|-----------|
| Backend | NestJS (TypeScript) + Prisma + PostgreSQL |
| Frontend | Next.js 14 (App Router, TypeScript) |
| Auth | Mock JWT (UUID como token, Supabase-ready) |
| Tiempo real | WebSockets (NestJS Gateway — Sprint 6) |
| UI | Tailwind CSS + componentes propios |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Jest (TDD en domain + application layers) |

## Funcionalidades principales

- **Pedidos online** — carta digital, personalizacion de platos (variantes + modificadores), delivery y pickup
- **Multi-sede** — una empresa puede tener varias sedes con horarios y zonas de reparto independientes
- **Alergenos** — informacion por plato con filtrado por intolerancias (14 alergenos EU)
- **Fidelizacion** — puntos por pedido, canje por descuentos, reglas configurables por empresa (Sprint 5)
- **Vista operativa** — panel para cocina/barra con pedidos en tiempo real (Sprint 6)
- **White-label total** — dominio propio, branding propio, Yantar invisible

## Estructura del monorepo

```
apps/
  backend/          NestJS API (arquitectura hexagonal, DDD)
  web/              Next.js (customer + admin + operativo)
packages/
  shared/           Tipos y enums compartidos (@yantar/shared)
```

## Arquitectura

El backend sigue **arquitectura hexagonal** con separacion estricta por capas:

```
domain/          Entidades, value objects, ports (interfaces), domain services
application/     Use cases (un servicio por caso de uso), DTOs con class-validator
infrastructure/  Controllers (REST), repositories (Prisma), adapters, gateways (WS)
```

**Regla**: las capas domain y application no importan NestJS ni Prisma.
Las dependencias cross-domain se resuelven unicamente a traves de ports.

---

## Progreso por Sprints

### Sprint 1 — Identity + Company (Backend) ✅

**Identity domain** (`apps/backend/src/identity/`)
- Entidad `User` con roles: `CUSTOMER`, `RESTAURANT_ADMIN`, `SUPERADMIN`
- `POST /auth/register` — registro de cliente (requiere `companyId`)
- `POST /auth/login` — login por email + companyId (mock auth, devuelve token = userId)
- `POST /auth/register-business` — registro de empresa + admin
- `GET /auth/me` — perfil del usuario autenticado
- `PATCH /auth/profile` — actualizar perfil
- `MockAuthAdapter` — token Bearer = UUID del usuario (sin Supabase por ahora)

**Company domain** (`apps/backend/src/company/`)
- Entidad `Company` con branding (colores, logo, slug)
- Entidad `Branch` (sede) con horarios y zonas de reparto
- CRUD de empresas, sedes, horarios operativos y zonas de delivery
- Multi-tenancy: todos los recursos aislados por `companyId`

**Shared** (`packages/shared/`)
- Enums: `UserRole`, `OrderStatus`, `DeliveryMode`, `DishStatus`, `AllergenCode`, `ServiceMode`, `RewardType`, `TransactionType`
- `DomainError` — clase base para errores de dominio
- `DomainExceptionFilter` — mapea errores de dominio a HTTP status codes

---

### Sprint 2 — Menu + Allergen (Backend) ✅

**Menu domain** (`apps/backend/src/menu/`)
- Entidad `Dish` con `calculatePrice(variantOptionId?, modifierOptionIds[])` y `toggleAvailability()`
- `VariantGroup` / `VariantOption` — seleccion unica (radio), con ajuste de precio
- `ModifierGroup` / `ModifierOption` — SINGLE o MULTIPLE, min/max selecciones, precio extra
- `Category` con ordering configurable
- **Endpoints publicos (customer):**
  - `GET /menu/:companyId` — carta completa con filtro de alergenos (`?exclude=GLUTEN,DAIRY`)
  - `GET /menu/:companyId/dishes/:dishId` — detalle de plato con variantes y modificadores
- **Endpoints admin:**
  - `POST/PATCH /admin/menu/dishes` — crear/editar plato
  - `PATCH /admin/menu/dishes/:id/availability` — activar/desactivar plato
  - `POST/PATCH/DELETE /admin/menu/categories` — gestion de categorias
- Estrategia de persistencia: cascade replace en variantes/modificadores via `$transaction`

**Allergen domain** (`apps/backend/src/allergen/`)
- 14 alergenos EU segun Reglamento UE 1169/2011 (seed data en migracion)
- `AllergenFilterService` — funciones puras: `filterSafeDishes`, `getAllergenSummary`
- Integrado en `GetMenuService`: filtra platos segun alergenos excluidos
- `GET /allergens` — catalogo oficial de alergenos

---

### Sprint 3 — Order (Backend) ✅

**Order domain** (`apps/backend/src/order/`)

**State machine completa:**
```
PENDING → ACCEPTED → PREPARING → READY → DELIVERED
PENDING → REJECTED
PENDING/ACCEPTED → CANCELLED
```

**Entidades:**
- `Order` con `accept()`, `reject()`, `startPreparing()`, `markReady()`, `markDelivered()`, `cancel()`, `isCancellable()`, `isActive()`
- `OrderItem` con calculo de `lineTotal` server-side (precio recalculado desde la BD, no del cliente)

**Cross-domain:**
- `IDishCheckerPort` en order domain, implementado por `MenuDishCheckerAdapter` en order infrastructure
- El servidor recalcula precios desde el catalogo — el cliente no puede manipular precios

**Endpoints customer:**
- `POST /orders` — crear pedido desde carrito
- `GET /orders/history` — historial paginado
- `GET /orders/:orderId` — detalle del pedido
- `PATCH /orders/:orderId/cancel` — cancelar pedido

**Endpoints admin/operativo:**
- `GET /admin/orders` — pedidos activos por sede
- `PATCH /admin/orders/:id/accept` — aceptar con tiempo estimado
- `PATCH /admin/orders/:id/reject` — rechazar con motivo
- `PATCH /admin/orders/:id/preparing` / `ready` / `delivered` — avanzar estado

---

### Sprint 4 — Frontend Customer (Web-App) ✅

**Auth** (`apps/web/src/features/auth/`)
- `AuthProvider` — contexto global, hidrata desde localStorage en mount, llama `GET /auth/me`
- `useAuth` hook — expone `user`, `isAuthenticated`, `login()`, `logout()`
- `/login` — llama `POST /auth/login`, guarda token en localStorage, redirige a `/menu`
- `/register` — llama `POST /auth/register`, auto-login, redirige a `/menu`

**Menu** (`apps/web/src/features/menu/`)
- `useMenu` — React Query, llama `GET /menu/:companyId`, filtra alergenos via query param
- `useAllergenFilter` — estado local de alergenos excluidos con toggle/clear
- `CategoryNav` — navegacion horizontal con scroll-to-section
- `DishCard` — tarjeta de plato con imagen, precio y boton de accion
- `AllergenFilter` — panel de filtros con los 14 alergenos EU
- `/menu` — pagina real conectada a la API con skeleton loading

**Cart** (`apps/web/src/features/cart/`)
- `CartProvider` — estado con `useReducer`, persistido en `localStorage`
- Merge automatico de items identicos (mismo plato + variante + modificadores + notas)
- `CartDrawer` — panel lateral deslizante con items, cantidades y total
- `CartBadge` — contador en el header del restaurante
- `useCart` — hook publico con `addItem`, `removeItem`, `updateQuantity`, `clear`

**Dish detail** (`/dish/[dishId]`)
- `useDishDetail` — React Query, llama `GET /menu/:companyId/dishes/:dishId`
- `VariantSelector` — radio buttons con ajuste de precio visible
- `ModifierSelector` — checkboxes/radio con limite de selecciones y precio extra
- Calculo de precio en tiempo real (basePrice + variant + modifiers)
- Notas opcionales por plato
- Barra inferior fija con selector de cantidad y boton de agregar

**Checkout** (`/checkout`)
- Selector PICKUP / DELIVERY
- Formulario de direccion (solo si DELIVERY)
- Selector de metodo de pago (efectivo / tarjeta)
- Resumen del pedido con subtotal + gastos de envio
- Llama `POST /orders`, limpia carrito y redirige al tracking

**Order tracking** (`/orders/[orderId]`)
- Stepper visual con los 5 estados del pedido
- Estados terminales (REJECTED, CANCELLED) con mensaje diferenciado
- Polling automatico cada 5 segundos mientras el pedido esta activo
- Detalle completo: items, variantes, modificadores, totales

---

### Sprint 5 — Loyalty + Panel Admin ✅

**Loyalty domain** (`apps/backend/src/loyalty/`)
- Entidad `LoyaltyAccount` con `award(points)`, `redeem(points)`, `canRedeem(points)`
- Entidad `Reward` con `isAvailable()` y `consume()` (gestiona stock y fechas de validez)
- Entidad `PointsTransaction` — historial inmutable de movimientos (EARNED / REDEEMED)
- `PointsCalculationService` — funciones puras: calculo de puntos por euro y valor del descuento
- Errores de dominio: `InsufficientPointsError` (422), `RewardNotAvailableError` (422)
- `LoyaltyConfig` — modelo independiente por empresa (puntos por euro, valor del punto, minimo de canje)
- **Endpoints customer:** `GET /loyalty/balance`, `GET /loyalty/rewards`, `POST /loyalty/redeem`, `GET /loyalty/history`
- **Endpoints admin:** `GET/PUT /admin/loyalty/config`, `GET/POST/PUT/DELETE /admin/loyalty/rewards`

**Cross-domain Loyalty ↔ Order:**
- `ILoyaltyChecker` port definido en Order domain, implementado por `LoyaltyCheckerAdapter` en Loyalty
- `UpdateOrderStatusService` otorga puntos automaticamente al marcar pedido como DELIVERED (no critico — fallo en loyalty no afecta al pedido)
- Dependencia circular `OrderModule ↔ LoyaltyModule` resuelta con `forwardRef()`

**Panel Admin** (`apps/web/src/app/(admin)/admin/`)
- Layout con sidebar de navegacion y guard de rol `RESTAURANT_ADMIN`
- Rutas bajo `/admin/*` para evitar conflicto con rutas del customer (`/menu`, `/orders`)
- `/admin/dashboard` — KPIs del dia + pedidos activos con polling cada 10 segundos
- `/admin/menu` — lista de platos con toggle de disponibilidad, edicion y borrado
- `/admin/menu/new` — formulario de creacion de plato (nombre, precio, categoria, alergenos)
- `/admin/menu/[dishId]` — formulario de edicion de plato
- `/admin/menu/categories` — CRUD de categorias inline
- `/admin/orders` — gestion de pedidos con filtro activos/completados/todos y botones de accion
- `/admin/loyalty` — configuracion del programa de fidelizacion
- `/admin/loyalty/rewards` — CRUD de recompensas con formulario inline

---

## Proximos Sprints

### Sprint 6 — WebSocket + Vista Operativa (pendiente)
- `OrderEventsGateway` — eventos en tiempo real para vista operativa
- Vista operativa (tablet): pedidos entrantes, cambio de estado desde cocina
- Sustituir polling del cliente por WebSocket

### Sprint 7 — Branding + Sedes + Settings (pendiente)
- Panel admin: gestion de sedes, horarios operativos, zonas de reparto
- Configuracion de branding (logo, colores, tipografia) con preview en tiempo real

---

## Desarrollo local

### Requisitos

- Node.js >= 20
- pnpm >= 9
- Docker (para PostgreSQL)

### Instalacion

```bash
# Instalar dependencias
pnpm install

# Compilar paquete shared (necesario para TypeScript)
cd packages/shared && npx tsc && cd ../..

# Levantar PostgreSQL
docker compose up -d

# Migrar base de datos y ejecutar seed
cd apps/backend
npx prisma migrate deploy
npx prisma db seed
```

### Variables de entorno

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL=postgresql://yantar:yantar@localhost:5432/yantar
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COMPANY_ID=<uuid-de-la-empresa>
NEXT_PUBLIC_COMPANY_SLUG=nombre-restaurante
NEXT_PUBLIC_BRANCH_ID=<uuid-de-la-sede>
```

### Arrancar en desarrollo

```bash
# Desde la raiz del monorepo
pnpm dev

# O por separado:
pnpm --filter @yantar/backend dev   # http://localhost:3001
pnpm --filter @yantar/web dev       # http://localhost:3000
```

### Tests

```bash
cd apps/backend
npx jest --passWithNoTests
```

Los tests cubren las capas **domain** y **application** (TDD estricto).
La capa de infraestructura se verifica mediante tests de integracion e2e (pendiente).

**Cobertura actual: 259 tests, 40 suites — todos en verde.**

### Migracion de base de datos (Sprint 5)

El Sprint 5 añade el modelo `LoyaltyConfig`. Ejecutar tras actualizar:

```bash
cd apps/backend
npx prisma migrate dev --name add-loyalty-config
```

---

## Flujo del cliente (happy path)

1. Accede a `pedir.restaurante.es` → carta del restaurante
2. (Opcional) Filtra alergenos
3. Selecciona plato → elige variante + modificadores + notas
4. Agrega al carrito (persiste entre sesiones)
5. Va al checkout → elige PICKUP o DELIVERY + metodo de pago
6. Confirma pedido → tracking en tiempo real
7. El restaurante acepta desde la vista operativa
8. Cliente ve el progreso: Aceptado → Preparando → Listo → Entregado
