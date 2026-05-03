# Yantar

Plataforma SaaS white-label de delivery para restaurantes. Cada empresa obtiene su propia web-app de pedidos personalizada (logo, colores, dominio propio) lista para usar. Yantar opera como infraestructura invisible.

## Stack Tecnologico

| Componente | Tecnologia |
|------------|-----------|
| Backend | NestJS (TypeScript) + Prisma + PostgreSQL |
| Frontend | Next.js 14 (App Router, TypeScript) |
| Auth | Mock JWT + bcrypt password hashing (Supabase-ready) |
| Tiempo real | WebSockets (NestJS Gateway — Sprint 6) |
| UI | Tailwind CSS + componentes propios |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Jest (backend, TDD) + Vitest (frontend, unit tests) |

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

---

### Sprint 6 — WebSocket + Vista Operativa ✅

**Backend — WebSocket** (`apps/backend/src/order/infrastructure/gateways/`)
- `OrderEventsGateway` — gateway Socket.io en namespace `/orders`
- Rooms por `branch:{branchId}` (vista operativa) y `order:{orderId}` (customer tracking)
- Eventos emitidos: `order:new`, `order:status-changed`
- Suscripciones cliente: `branch:subscribe`, `order:subscribe`
- `WsNotificationAdapter` — implementa `INotificationService`, sustituye `NullNotificationAdapter`

**Frontend operativo** (`apps/web/src/app/(operativo)/operativo/`)
- Vista kanban con columnas: Pendiente / Aceptado / Preparando / Listo
- `useBranchOrderEvents` — hook WebSocket que actualiza React Query cache en tiempo real
- `useActiveOrders` — carga inicial HTTP + actualizaciones WS sin polling
- `OrderKanbanCard` — tarjeta con acciones por estado: aceptar (con tiempo estimado), rechazar, preparar, listo, entregado
- Layout con guard de rol `RESTAURANT_ADMIN`

**Frontend customer (mejora)**
- `useOrderStatus` — WebSocket como canal principal + polling cada 10s como fallback
- `useOrderSocketSubscription` — suscribe al room `order:{orderId}` y actualiza cache directamente

---

---

### Sprint 7 — Admin: Sedes + Settings + Branding ✅

**Backend:**
- `GetCompanyConfigService`: nuevo método `executeById(companyId)` para acceso admin sin slug
- `CompanyAdminController`: nuevo endpoint `GET /admin/company/config`

**Frontend admin:**
- `/admin/branches` — lista de sedes con modalidades de servicio, edición y borrado
- `/admin/branches/new` — formulario de creación (nombre, dirección, teléfono, email, modos de servicio)
- `/admin/branches/[branchId]` — edición de sede + `HoursEditor` con horarios por día de la semana
- `/admin/settings` — hub de configuración con acceso rápido a branding y sedes
- `/admin/settings/branding` — editor completo: appName, logo, welcomeMessage, paleta de 7 colores con preview en tiempo real

**Hooks añadidos** (`features/admin-company/`):
- `useAdminBranches`, `useCreateBranch`, `useUpdateBranch`, `useDeleteBranch`
- `useOperatingHours`, `useSetOperatingHours`
- `useCompanyConfig`, `useUpdateBranding`

---

## Proximos Sprints

### Sprint 8 — Customer: Loyalty visible + Historial + Perfil ✅

**Feature loyalty** (`apps/web/src/features/loyalty/`):
- `useLoyaltyBalance`, `useLoyaltyRewards`, `useLoyaltyHistory`, `useRedeemPoints` — hooks con React Query
- `PointsBadge` — puntos actuales en el header del restaurante, link al perfil (solo visible si autenticado)
- `RewardsList` — lista de recompensas canjeables/bloqueadas según balance actual
- `RedeemAtCheckout` — panel expandible en checkout para seleccionar recompensa, calcula descuento en tiempo real

**Páginas customer nuevas:**
- `/orders` — historial de pedidos con estado (badge color), items, fecha y total; link al tracking
- `/profile` — avatar, tarjeta de puntos con totales acumulados/canjeados, recompensas disponibles, últimos 5 movimientos de puntos, botón logout

**Checkout actualizado:**
- Integra `RedeemAtCheckout` antes del resumen
- Descuento aplicado en desglose (subtotal + envio − descuento = total)
- `rewardId` enviado al backend al confirmar pedido

**Layout customer:** añadidos links a `/orders` y `PointsBadge` en barra de navegación

**Cleanup:** eliminados stubs `(operativo)/orders/page.tsx` y `(operativo)/layout.tsx`

---

### Sprint 9 — Cobertura de tests completa ✅

**Tests añadidos** (+19 tests, 42 suites, 278 total):

**Loyalty application layer:**
- `GetBalanceService`: retorna DTO con balance correcto, cuenta nueva con balance 0
- `GetRewardsService`: mapea rewards a DTOs, lista vacía, `isAvailable=false` cuando stock=0
- `GetPointsHistoryService`: retorna transacciones, array vacío si no existe cuenta, respeta limit/offset

**Order application layer:**
- `GetOrderService`: retorna DTO, lanza `OrderNotFoundError`
- `GetOrderHistoryService`: retorna lista, array vacío, reenvía limit/offset al repositorio
- `GetActiveOrdersService`: retorna pedidos activos por sede, array vacío
- `CancelOrderService`: cancela pedidos PENDING y ACCEPTED, lanza error si no existe, no notifica en ese caso

---

### Sprint 10 — Auth con bcrypt + Branding dinámico en SSR ✅

**Auth — contraseñas reales** (`apps/backend/src/identity/`):
- `IPasswordService` — nuevo port en domain layer: `hash(plaintext)` / `verify(plaintext, hash)`
- `BcryptPasswordAdapter` — implementación con bcrypt (10 salt rounds), inyectado via DI (`'IPasswordService'`)
- `LoginService` — verifica contraseña contra hash almacenado; si `passwordHash === null` (legacy), permite acceso para compatibilidad
- `RegisterUserService` — hashea la contraseña con `Promise.all([createAuthUser, hash])` antes de persistir
- `InvalidCredentialsError` — nuevo error de dominio (`code: 'INVALID_CREDENTIALS'`), mapea a HTTP 401 en `DomainExceptionFilter`
- Migración Prisma: columna `password_hash VARCHAR` en tabla `users`
- Seed actualizado: admin `admin@napoli.es` con contraseña `admin123` hasheada con bcrypt

**Frontend — branding dinámico sin FOUC** (`apps/web/src/`):
- `lib/color-utils.ts` — utilidad pura `hexToHsl(hex)` convierte `#rrggbb` → `"H S% L%"` (formato variables CSS de Tailwind); `buildBrandingCssVars(config)` mapea los 7 colores del branding al bloque `:root { --primary: ... }`
- `app/(customer)/layout.tsx` convertido a **async Server Component**: llama `GET /companies/:slug/config` en render time con `next: { revalidate: 300 }`, inyecta `<style>:root { ... }</style>` antes del HTML — el cliente recibe el tema correcto en el primer byte, sin flash
- `app/(auth)/login/page.tsx` — redirect post-login basado en rol: `RESTAURANT_ADMIN` → `/admin/dashboard`, `CUSTOMER` → `/menu`
- `app/(admin)/admin/page.tsx` — nueva página raíz `/admin` que hace `redirect('/admin/dashboard')` para evitar 404 al navegar directamente

**Tests frontend** (`apps/web/`):
- `vitest` añadido como test runner para el frontend
- `lib/color-utils.test.ts` — 16 tests unitarios: blanco/negro/rojo/verde/azul, shorthand `#rgb`, colores acromaticos, colores reales de marca, `buildBrandingCssVars` con campos nulos

**Fix validación UUID** (`apps/backend/src/`):
- DTOs que recibían `companyId` de datos de seed (UUID versión 0) fallaban con `@IsUUID()` (que valida solo v4 por defecto)
- `LoginDto.companyId` cambiado a `@IsString()` (el formato se verifica en el modelo de dominio)
- `RedeemDto.companyId` cambiado a `@IsUUID('all')` para aceptar cualquier versión

**Tests** (+11 tests respecto Sprint 9):
- `login.service.spec.ts` — 5 tests: usuario no encontrado, contraseña incorrecta, login correcto, verificación contra hash, compatibilidad con passwordHash nulo
- `user.entity.spec.ts` — 4 tests nuevos: passwordHash nulo por defecto en createCustomer/createAdmin, almacenado si se pasa, preservado en updateProfile

**Cobertura total: 289 tests, 43 suites — todos en verde.**

---

### Sprint 11 — Selector de franja horaria en checkout ✅

**Caso de uso:** El cliente puede elegir si quiere recibir su pedido *lo antes posible* o en una franja horaria concreta del día. El sistema genera las franjas disponibles en base al horario real del restaurante, excluyendo las que ya han pasado (margen mínimo de 30 minutos desde el momento actual).

**Backend — nuevas piezas (TDD estricto):**

- `AvailabilityService.generateTimeSlots(hours, targetDate, now, intervalMinutes)` — función pura añadida al servicio de dominio existente:
  - Genera franjas cada `intervalMinutes` (30 min) dentro del horario del día
  - Si el día destino es hoy, excluye franjas con menos de 30 min de margen respecto a `now`
  - Devuelve `{ label: "14:30", value: "ISO string" }[]`
  - Sin efecto en días marcados como cerrados o sin horario configurado

- `GetTimeSlotsService` — nuevo use case en application layer:
  - Recibe `{ companyId, branchId, date?, now? }` — `date` por defecto es hoy
  - Verifica que la sede existe y pertenece a la empresa (`BranchNotFoundError` si no)
  - Delega la generación al dominio
  - Devuelve `{ date: string, slots: TimeSlot[] }`

- `CompanyPublicController` — nuevo endpoint público:
  ```
  GET /companies/:slug/branches/:branchId/slots?date=YYYY-MM-DD
  ```

- `CompanyConfigResponse` — añadido campo `id` para que el endpoint pueda resolver `companyId` desde el slug sin inyectar el repositorio en el controlador

**Frontend:**

- `features/checkout/hooks/use-time-slots.ts` — React Query, llama al nuevo endpoint con `staleTime: 5 min`
- `features/checkout/components/TimeSlotSelector.tsx` — botón "Lo antes posible" siempre visible + pills con las franjas disponibles; skeleton de carga mientras se resuelve la query
- `app/(customer)/checkout/page.tsx` — nueva sección "¿Cuándo quieres tu pedido?" entre modalidad de entrega y método de pago; `scheduledTime` incluido en el body de `POST /orders`; hora programada visible en el resumen del pedido
- `app/(customer)/orders/[orderId]/page.tsx` — muestra la hora programada bajo el stepper de estado
- `features/operativo/components/OrderKanbanCard.tsx` — badge azul "🕐 Para las 14:30" en la tarjeta operativa cuando el pedido tiene hora programada

**Tests** (+12 tests respecto Sprint 10):
- `availability.service.spec.ts` — 7 nuevos tests de `generateTimeSlots`: franjas vacías (sin horario, día cerrado), generación correcta de intervalos, exclusión de pasadas, ISO value, día futuro sin filtro
- `get-time-slots.service.spec.ts` — 5 tests: `BranchNotFoundError`, branch cerrado, franjas correctas, fecha en respuesta, default a hoy

**Cobertura total: 301 tests, 44 suites — todos en verde.**

---

### Sprint 12 — Selección de sede y zonas de reparto con polígonos ✅

**Caso de uso:** Al entrar en la web del restaurante el cliente siempre ve una *landing page* donde elige la sede y la modalidad (recogida o domicilio). Para domicilio introduce su dirección; el sistema la geocodifica con Nominatim y comprueba si cae dentro de algún polígono de reparto de la sede. El administrador define esas zonas dibujando polígonos directamente sobre un mapa Leaflet.

**Backend — nuevas piezas (TDD estricto):**

- `DeliveryZone.polygon` — campo `GeoPolygon | null` añadido a la entidad: `withPolygon()`, `toProps()` privado, serialización en el repositorio Prisma
- `AvailabilityService.isPointInZone(zone, lat, lng)` — función pura usando `@turf/turf` v6 (CommonJS): comprueba si un punto lat/lng cae dentro del polígono GeoJSON de la zona
- `GetBranchesService` — devuelve el listado de sedes activas de la empresa con sus modos de servicio
- `CheckDeliveryService` — dada una sede y coordenadas, itera sus zonas activas con `isPointInZone` y devuelve `{ zoneId, zoneName, deliveryFee, estimatedTimeMinutes, minOrderAmount }` o `null` si ninguna cubre el punto
- Migración Prisma — columna `polygon JSONB` en la tabla `delivery_zones`
- `CompanyPublicController` — tres nuevos endpoints públicos:
  ```
  GET  /companies/:slug/branches
  POST /companies/:slug/check-delivery  { branchId, lat, lng }
  ```
- `CompanyAdminController` — endpoint de edición de polígono:
  ```
  PATCH /admin/company/delivery-zones/:zoneId/polygon  { polygon: GeoPolygon | null }
  ```

**Frontend — Customer:**

- `BranchContext` + `BranchProvider` — contexto React con persistencia en `localStorage` (`yantar_selected_branch`): almacena `{ id, name, address, deliveryMode, deliveryFee, deliveryZoneId, customerAddress? }`
- `features/branch/hooks/use-branches.ts` — React Query, llama a `GET /companies/:slug/branches`
- `features/branch/hooks/use-check-delivery.ts` — geocodifica la dirección con Nominatim (OSM, sin API key) y llama a `POST /companies/:slug/check-delivery`
- `features/branch/components/LandingPage.tsx` — flujo de 3 pasos: elegir sede → elegir modalidad → introducir dirección; maneja el caso de zona fuera de reparto con botón de fallback a recogida; siempre visible para que el cliente pueda cambiar de sede
- `app/page.tsx` — convertida a Server Component asíncrono: descarga la configuración de branding (`/companies/:slug/config`) y la inyecta como CSS vars en `:root` antes de renderizar la landing
- `app/(customer)/checkout/page.tsx` — elimina el selector de modalidad y el input de dirección (ya resueltos en la landing); muestra un resumen de la sede y modo elegidos; usa `deliveryFee` y `customerAddress` del contexto para el body del pedido

**Frontend — Admin:**

- `features/admin-company/hooks/use-delivery-zones.ts` — hooks React Query: `useDeliveryZones`, `useCreateZone`, `useUpdateZone`, `useDeleteZone`, `useUpdateZonePolygon`
- `features/admin-company/components/DeliveryZoneMapEditor.tsx` — mapa Leaflet imperativo (sin react-leaflet SSR), carga dinámica en cliente:
  - Muestra el polígono existente en azul (`#0ea5e9`)
  - Herramienta de dibujo de polígonos (`leaflet-draw`) — solo polígonos, sin rutas ni círculos
  - Eventos `CREATED / EDITED / DELETED` actualizan el estado pendiente
  - Botón "Guardar zona en mapa" solo visible cuando hay cambios sin guardar
- `features/admin-company/components/DeliveryZonesSection.tsx` — sección completa de gestión de zonas: listado, formulario de creación, edición inline, eliminación con confirmación, botón "Ver mapa" para expandir el editor
- `app/(admin)/admin/branches/[branchId]/page.tsx` — añade `<DeliveryZonesSection>` debajo de `<HoursEditor>` cuando la sede tiene DELIVERY activo

**Tests** (+8 tests respecto Sprint 11):
- `availability.service.spec.ts` — 4 nuevos tests de `isPointInZone`: punto dentro, punto fuera, zona inactiva, zona sin polígono
- `get-branches-check-delivery.service.spec.ts` — 7 tests nuevos (3 de `GetBranchesService`, 4 de `CheckDeliveryService`): empresa no encontrada, sin sedes activas, punto en zona, punto fuera de zona

**Cobertura total: 312 tests, 45 suites — todos en verde.**

---

### Sprint 12.1 — Fixes post-integración y autocompletado de dirección ✅

**Fixes:**

- `CheckDeliveryBody` (controlador público) — faltaban decoradores `@IsString` / `@IsNumber`; el `ValidationPipe` con `whitelist: true` descartaba los tres campos (`branchId`, `lat`, `lng`) provocando que todas las direcciones fallaran como fuera de zona
- `DeliveryZoneMapEditor` — `leaflet-draw` requiere `window.L` como global antes de cargarse; se asigna explícitamente tras importar Leaflet. También se limpia `_leaflet_id` del contenedor antes de inicializar para evitar el error `Map container is already initialized` en hot reload de Next.js

**Mejora UX — autocompletado de dirección:**

- Al escribir 3+ caracteres en el campo de dirección de la landing, se consulta Nominatim con debounce de 350 ms
- Resultados filtrados a España (`countrycodes=es`) — evita ambigüedades con calles homónimas en otras ciudades (causa raíz del fallo de geocodificación original)
- Dropdown con hasta 5 sugerencias en formato legible: `Calle, número, ciudad, provincia`
- Al seleccionar una sugerencia el texto se carga en el input; el usuario confirma manualmente pulsando el botón
- Spinner de carga mientras se obtienen sugerencias; cierre con clic fuera o tecla Escape

---

### Sprint 13 — Eliminar `NEXT_PUBLIC_COMPANY_ID` ✅

**Caso de uso:** La variable `NEXT_PUBLIC_COMPANY_ID` era un UUID hardcodeado en `.env.local` que rompía el modelo white-label: un nuevo restaurante tenía que conocer y configurar su UUID interno. Ahora solo hace falta `NEXT_PUBLIC_COMPANY_SLUG` (el nombre amigable) y el sistema resuelve el UUID automáticamente desde la API.

**Cambios:**

- `features/company/hooks/use-company-config.ts` — nuevo hook React Query que llama a `GET /companies/:slug/config` (endpoint ya existente y testeado). `staleTime: Infinity` para no repetir la llamada durante la sesión.
- `features/menu/hooks/use-menu.ts` — usa `useCompanyConfig()` para obtener `companyId`; query desactivada hasta que se resuelva (`enabled: !!companyId`)
- `features/menu/hooks/use-dish-detail.ts` — mismo patrón
- `features/admin-menu/hooks/use-admin-dishes.ts` y `use-admin-categories.ts` — los endpoints admin resuelven `companyId` desde el JWT; se reemplaza `COMPANY_ID` por `COMPANY_SLUG` solo en la clave de caché de React Query
- `app/(auth)/login/page.tsx` y `register/page.tsx` — obtienen `companyId` de `useCompanyConfig()` en lugar del env var
- `.env.local` — eliminada la variable `NEXT_PUBLIC_COMPANY_ID`

**Resultado:** Para desplegar Yantar en un nuevo restaurante solo hacen falta dos variables:
```env
NEXT_PUBLIC_API_URL=https://api.mirestaurante.es
NEXT_PUBLIC_COMPANY_SLUG=mi-restaurante
```

---

### Sprint 14 — Selector de sede dinámico (multi-sede real) ✅

**Caso de uso:** La vista operativa, el dashboard y el historial de pedidos del admin estaban anclados a `NEXT_PUBLIC_BRANCH_ID`, un UUID hardcodeado en `.env.local`. Con múltiples sedes, un empleado/admin necesita poder elegir qué sede está viendo sin tocar ningún fichero de configuración.

**Cambios:**

- `features/operativo/hooks/use-selected-branch.ts` — hook compartido que carga las sedes del admin (`useAdminBranches()`), auto-selecciona si solo hay una, y persiste la elección en `localStorage` bajo `yantar_admin_selected_branch`
- `features/operativo/components/BranchSelectorBar.tsx` — componente de selector:
  - **1 sede:** muestra solo el nombre, sin interacción (sin fricción en el caso habitual)
  - **N sedes:** dropdown con todas las sedes disponibles; cambiar sede recarga los datos al instante
- `app/(operativo)/operativo/page.tsx` — usa `useSelectedBranch()` en lugar del env var; muestra `BranchSelectorBar` en la cabecera del kanban
- `app/(admin)/admin/dashboard/page.tsx` — mismo patrón; selector en la esquina superior derecha
- `app/(admin)/admin/orders/page.tsx` — mismo patrón; queries y WebSocket se actualizan al cambiar de sede

**Resultado:** `NEXT_PUBLIC_BRANCH_ID` ya no es necesario para el funcionamiento de la aplicación. La variable puede eliminarse del `.env.local` en producción.

---

### Sprint 15 — Tests de integración en el frontend (Vitest) ✅

**Objetivo:** Cubrir con tests automatizados los hooks y componentes clave del frontend introducidos en los sprints anteriores. Se sigue el mismo estilo de mock‑first que en los tests de backend: RED → GREEN → REFACTOR.

**Infraestructura de test:**

- `vitest.config.ts` — entorno `jsdom`, globals activados, alias `@/` para `src/`
- `src/test/setup.ts` — imports de `@testing-library/jest-dom`; mocks globales de `next/navigation` (useRouter, useParams, usePathname, useSearchParams), `next/image` y `localStorage`
- `src/test/test-utils.tsx` — `customRender` y `customRenderHook` con `QueryClientProvider` envolviendo cada test; `retry: false, gcTime: 0` para evitar retries y caches entre tests

**Tests añadidos (4 suites, 26 tests):**

| Suite | Tests | Qué cubre |
|-------|-------|-----------|
| `use-company-config.test.ts` | 5 | Resolución de id desde slug, endpoint correcto, campos de branding, estado de carga, propagación de errores |
| `use-selected-branch.test.ts` | 6 | Loading state, auto-selección (1 sede y múltiples), restauración desde localStorage, fallback a primera sede si el id guardado ya no existe, persistencia al cambiar |
| `BranchSelectorBar.test.tsx` | 5 | Skeleton durante carga, texto simple para sede única, null para sede única sin selección, dropdown con todas las sedes, llamada a `setSelectedBranchId` al cambiar opción |
| `LandingPage.test.tsx` | 10 | Nombre de franquicia en cabecera, listado de sedes, skeletons de carga, navegación entre pasos, recogida en local (selectBranch + router.push), paso de dirección, botón deshabilitado sin dirección, flujo completo de delivery exitoso, error de zona fuera de reparto, vuelta atrás entre pasos |

**Patrones usados:**
- `vi.mock` + `await import` para mocks a nivel de módulo sin contaminar otros tests
- `vi.hoisted` para capturar referencias a `vi.fn()` accesibles dentro de factories de `vi.mock` (caso `useRouter` de `next/navigation`)
- `vi.mocked(...).mockReturnValue` para controlar la respuesta del hook en cada test
- `userEvent` (v14) para interacciones de usuario realistas (click, type, selectOptions)
- `waitFor` para aserciones sobre estado asíncrono (React Query, promesas de mutation)

**Cobertura total frontend: 42 tests, 5 suites — todos en verde.**

---

### Sprint 16 — VariantGroupEditor y ModifierGroupEditor (TDD) ✅

**Objetivo:** Añadir a `DishForm` la capacidad de gestionar variantes y modificadores directamente, sin depender de flujos separados. Ciclo TDD estricto en la capa de componentes React.

**Componentes implementados:**

- `VariantGroupEditor` — Gestiona grupos de variantes (ej: "Tamaño"). Cada grupo tiene nombre y lista de opciones con precio. Añadir/eliminar grupos y opciones inline.
- `ModifierGroupEditor` — Gestiona grupos de modificadores (ej: "Extras"). Añade `selectionType` (SINGLE/MULTIPLE), `required`, `minSelections`, `maxSelections`.

**Integración en `DishForm`:**
- Tres nuevas Cards: "Imagen", "Variantes", "Modificadores"
- `variantGroups` y `modifierGroups` incluidos en el payload del formulario (sin IDs temporales)

**Tests añadidos (2 suites, 14 tests):**

| Suite | Tests |
|-------|-------|
| `VariantGroupEditor.test.tsx` | 7 — render vacío, añadir grupo, añadir opción, actualizar nombre (fireEvent.change), eliminar opción, eliminar grupo, múltiples grupos |
| `ModifierGroupEditor.test.tsx` | 7 — render vacío, añadir grupo, selectionType selector, actualizar nombre, añadir opción, eliminar grupo, eliminar opción |

---

### Sprint 17 — Subida de imagen de plato (Multer + ImageUploader) ✅

**Objetivo:** Permitir al admin subir una foto para cada plato. Backend con endpoint Multer y frontend con `ImageUploader` + hook `use-upload-image`.

**Backend:**
- `POST /admin/menu/upload-image` — `FileInterceptor` (Multer), `diskStorage` en `public/uploads/`, filtro de MIME, límite 5 MB
- `NestExpressApplication` + `app.useStaticAssets()` para servir `public/` en producción
- Devuelve `{ url: "http://host/uploads/filename.jpg" }`

**Frontend:**
- `use-upload-image.ts` — hook que llama a `api.upload(FormData)`, gestiona `isUploading`
- `api.upload()` — `fetch` con `FormData` sin `Content-Type` (el navegador añade el boundary multipart)
- `ImageUploader.tsx` — input file oculto, preview con `<Image fill>`, estado "Subiendo...", botón "Eliminar imagen"

**Tests añadidos (1 suite, 6 tests):**

| Suite | Tests |
|-------|-------|
| `ImageUploader.test.tsx` | 6 — placeholder sin imagen, trigger input al hacer click, preview cuando hay URL, spinner durante upload, llamada a onChange con URL, eliminar imagen |

---

### Sprint 18 — Dashboard de estadísticas conectado (TDD) ✅

**Objetivo:** El dashboard del admin debe mostrar estadísticas reales del día (pedidos totales, entregados, ingresos, ticket medio), no solo pedidos activos.

**Backend:**

- Nuevo método `getByBranchAndDate(branchId, date)` en `IOrderRepository` y `PrismaOrderRepository` — consulta pedidos de un día completo (00:00–23:59:59)
- `GetDashboardStatsService` — calcula `ordersTotal`, `revenue`, `avgTicket`, `deliveredCount`, `activeCount`, `cancelledCount` a partir de pedidos entregados del día
- `GET /admin/orders/stats?branchId=&date=` — endpoint en `AdminOrderController` (colocado ANTES de `GET :orderId` para evitar conflicto de rutas)

**Tests backend (1 suite, 7 tests):**

| Suite | Tests |
|-------|-------|
| `get-dashboard-stats.service.spec.ts` | 7 — sin pedidos, solo activos, solo entregados, revenue correcto, avgTicket, cancelledCount, fecha de hoy por defecto |

**Frontend:**

- `use-dashboard-stats.ts` — hook React Query, `GET /admin/orders/stats`, `refetchInterval: 30000`, `enabled: !!branchId`
- `dashboard/page.tsx` — refactorizado para usar `useDashboardStats` (stats reales) + `useActiveOrders` (lista en tiempo real). KPIs: "Pedidos hoy", "Entregados hoy", "Ingresos hoy", "Ticket medio"

**Tests frontend (1 suite, 6 tests):**

| Suite | Tests |
|-------|-------|
| `use-dashboard-stats.test.ts` | 6 — disabled sin branchId, fetches con branchId, incluye date param, omite date si undefined, loading state, error state |

**Cobertura total:**
- Backend: 319 tests, 46 suites — todos en verde
- Frontend: 68 tests, 9 suites — todos en verde

---

## Desarrollo local

### Requisitos

- Node.js >= 20
- pnpm >= 10.13.1 (`npm install -g pnpm@10.13.1`)
- Docker Desktop (para PostgreSQL)

### Arrancar la demo (paso a paso)

```bash
# 1. Instalar dependencias del monorepo
pnpm install

# 2. Levantar PostgreSQL
docker compose up -d

# 3. Aplicar migraciones
cd apps/backend
npx prisma migrate deploy

# 4. Cargar datos de demo (Pizzeria Napoli)
npx prisma db seed

# 5. Compilar el backend
npx tsc

# 6. Arrancar backend y frontend
node dist/main.js          # http://localhost:3001
# En otra terminal:
cd ../web && npx next dev   # http://localhost:3000
```

### Variables de entorno

Los ficheros `.env` ya estan incluidos con los valores correctos para la demo local.

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://yantar:yantar_dev_password@localhost:5432/yantar_dev"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

El slug del tenant se resuelve en runtime desde el host (subdominio bajo
`yantar.app` o `localhost`), no de variables de entorno.

### Datos de demo

El seed carga la **Pizzeria Napoli** con:
- 13 platos en 5 categorias (Pizzas, Pasta, Entrantes, Bebidas, Postres)
- Variantes de tamaño y modificadores de extras para las pizzas
- Programa de fidelizacion con 3 recompensas
- 14 alergenos EU segun Reglamento UE 1169/2011

**Admin de prueba:** `admin@napoli.es` / `admin123`

### Tests

```bash
cd apps/backend
npx jest --passWithNoTests
```

Los tests cubren las capas **domain** y **application** (TDD estricto).
La capa de infraestructura se verifica mediante tests de integracion e2e (pendiente).

**Cobertura actual: 319 tests, 46 suites — todos en verde.**

Para tests de frontend (Vitest):

```bash
cd apps/web
pnpm test          # ejecuta una vez
pnpm test:watch    # modo watch
```

---

## Flujo del cliente (happy path)

1. Accede a `pedir.restaurante.es` → **landing page** con sedes de la franquicia
2. Elige sede → modalidad (recogida o domicilio)
3. Si domicilio → introduce dirección → el sistema verifica zona de reparto (polígono)
4. (Opcional) Filtra alergenos en la carta
5. Selecciona plato → elige variante + modificadores + notas
6. Agrega al carrito (persiste entre sesiones)
7. Va al checkout → elige franja horaria + método de pago
8. Confirma pedido → tracking en tiempo real
9. El restaurante acepta desde la vista operativa
10. Cliente ve el progreso: Aceptado → Preparando → Listo → Entregado
