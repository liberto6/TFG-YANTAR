# Architecture Rules — Yantar

## Stack Tecnologico

| Componente | Tecnologia |
|------------|-----------|
| Backend | NestJS (TypeScript) |
| ORM | Prisma |
| Base de datos | PostgreSQL (local → Supabase) |
| Frontend | Next.js 14+ (App Router, TypeScript) |
| Auth | Supabase Auth (JWT) |
| Tiempo real | WebSockets (NestJS Gateway) |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Jest + Testing Library |
| UI Components | shadcn/ui + Tailwind CSS |

## Regla Fundamental de Data Access

| Componente | Supabase SDK | Prisma Client |
|------------|-------------|---------------|
| **Auth** (JWT, login, getUser) | SI — unico uso permitido | NO |
| **Data persistence** (queries, mutations) | NO — prohibido para datos | SI — unico mecanismo |

- **Supabase SDK** se usa EXCLUSIVAMENTE para autenticacion (validar JWT, registro, login)
- **Prisma Client** es el unico ORM para acceso a datos
- En frontend, Supabase solo para auth; todo data access via HTTP al backend NestJS

## Backend (NestJS)

Enforced by `apps/backend/test/architecture.spec.ts`.

### Capas y Restricciones de Imports

```
+-----------------------------+
|  infrastructure/            |  ← Puede importar todo
|   controllers/ → endpoints  |
|   repositories/ → Prisma    |
|   gateways/ → WebSocket     |
|   adapters/ → externos      |
+-----------------------------+
|  application/               |  ← NO frameworks (NestJS, Prisma)
|   services (use cases)      |
|   dtos/                     |
+-----------------------------+
|  domain/                    |  ← NO frameworks
|   entities, ports, v.o.     |
+-----------------------------+
```

**Prohibido en domain/ y application/:**
```typescript
// Estos imports NO deben aparecer en domain/ ni application/
import { ... } from '@nestjs/*'
import { ... } from '@prisma/client'
import { ... } from '@supabase/*'
```

**Permitido en domain/application:**
- TypeScript nativo (interfaces, types, enums, classes)
- Tipos de `packages/shared`
- Librerias de validacion pura (class-validator en DTOs)

### Estructura por Bounded Context (Modulo NestJS)

```
apps/backend/src/{domain}/
  domain/
    entities/          # Clases puras TS con logica de negocio
    ports/             # Interfaces (repositories, servicios externos)
    value-objects/     # Enums, tipos inmutables
    services/          # Servicios de dominio (logica que no pertenece a una entidad)
    errors/            # Errores de dominio (extienden DomainError)
  application/
    services/          # Un servicio por use case, orquesta ports
    dtos/              # Request/Response DTOs (class-validator)
  infrastructure/
    controllers/       # NestJS controllers — traduce HTTP ↔ DTOs
    repositories/      # Implementaciones Prisma de los ports
    gateways/          # WebSocket gateways (si aplica)
    adapters/          # Adapters de servicios externos
  {domain}.module.ts   # NestJS module — registra providers e imports
```

**Inyeccion de dependencias** — NestJS DI nativa:
```typescript
// {domain}.module.ts
@Module({
  controllers: [OrderController],
  providers: [
    CreateOrderService,
    { provide: 'IOrderRepository', useClass: PrismaOrderRepository },
    { provide: 'INotificationService', useClass: WebSocketNotificationAdapter },
  ],
  exports: [CreateOrderService],
})
export class OrderModule {}

// application/services/create-order.service.ts
@Injectable()
export class CreateOrderService {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepo: IOrderRepository,
    @Inject('INotificationService') private readonly notifications: INotificationService,
  ) {}
}
```

### Cross-Domain Communication

**Regla**: Un dominio NO importa directamente de otro dominio. La comunicacion es a traves de **ports**.

```typescript
// order/domain/ports/loyalty-checker.port.ts
export interface ILoyaltyChecker {
  getAvailablePoints(customerId: string): Promise<number>
  redeemPoints(customerId: string, points: number): Promise<void>
}

// order/infrastructure/adapters/loyalty-checker.adapter.ts
@Injectable()
export class LoyaltyCheckerAdapter implements ILoyaltyChecker {
  constructor(private readonly loyaltyService: GetBalanceService) {}
  
  async getAvailablePoints(customerId: string): Promise<number> {
    return this.loyaltyService.execute(customerId)
  }
}
```

El adapter vive en **infrastructure/** del dominio consumidor.

### Errores de Dominio

```typescript
// shared/domain/errors/domain-error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string
}

// order/domain/errors/order-not-found.error.ts
export class OrderNotFoundError extends DomainError {
  readonly code = 'ORDER_NOT_FOUND'
}
```

Los controllers atrapan DomainError y traducen a HTTP:
```typescript
// shared/infrastructure/filters/domain-exception.filter.ts
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    // Mapea code → HTTP status
  }
}
```

### Multi-Tenancy

**Regla critica**: Toda query DEBE filtrar por `companyId` (o `branchId` cuando aplique).

```typescript
// CORRECTO
async getOrders(companyId: string, branchId: string): Promise<Order[]> {
  return this.prisma.order.findMany({
    where: { companyId, branchId }
  })
}

// INCORRECTO — falta filtro de tenant
async getOrders(customerId: string): Promise<Order[]> {
  return this.prisma.order.findMany({
    where: { customerId }
  })
}
```

---

## Frontend (Next.js App Router)

Enforced by `apps/web/test/architecture.spec.ts`.

### Estructura de Rutas (Route Groups)

```
apps/web/src/app/
  (customer)/              ← Web-app de pedidos (dominio del restaurante)
    menu/
    cart/
    checkout/
    orders/
    layout.tsx             ← Layout con branding del restaurante
  (admin)/                 ← Panel de administracion
    dashboard/
    menu-management/
    branches/
    settings/
    layout.tsx             ← Layout del panel admin
  (operativo)/             ← Vista operativa / cocina
    orders/
    layout.tsx             ← Layout tablet-friendly
  (auth)/                  ← Login, registro, perfil
    login/
    register/
    profile/
  layout.tsx               ← Root layout
```

### Feature-Based Organization

```
apps/web/src/features/
  cart/
    hooks/                 ← useCart, useCartActions
    components/            ← CartDrawer, CartItem, CartSummary
    types/                 ← Cart, CartItem interfaces
    lib/                   ← Logica pura (calculos de precios)
  menu/
    hooks/
    components/
    types/
    lib/
  orders/
    hooks/
    components/
    types/
    lib/
```

### Shared UI

```
apps/web/src/components/
  ui/                      ← shadcn/ui components
  layout/                  ← Headers, footers, sidebars por vista
```

### Theming White-Label

Cada empresa define su tema. Los componentes NUNCA usan colores hardcoded:
```tsx
// CORRECTO — usa variables CSS del tema
className="bg-primary text-primary-foreground"

// INCORRECTO — color hardcoded
className="bg-red-500 text-white"
```

El tema se carga desde la config de la empresa y se aplica via CSS custom properties:
```typescript
// Cargado desde el backend al acceder al dominio del restaurante
:root {
  --primary: ${company.branding.colors.primary};
  --secondary: ${company.branding.colors.secondary};
  // ...
}
```

### Data Fetching

- **Server Components** para datos estaticos (carta, info del restaurante)
- **Client Components + SWR/React Query** para datos dinamicos (estado del pedido, carrito)
- **WebSocket** para tiempo real (pedidos entrantes en vista operativa)
