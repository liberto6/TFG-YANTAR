# Architecture Rules — Yantar

## Regla Fundamental de Data Access

| Componente | Supabase SDK | SQLModel + AsyncSession |
|------------|-------------|------------------------|
| **Auth** (JWT, login, getUser) | SI — unico uso permitido | NO |
| **Data persistence** (queries, mutations) | NO — prohibido para datos | SI — unico mecanismo |

- **Supabase SDK** se usa EXCLUSIVAMENTE para autenticacion (validar JWT, `supabase.auth.*`)
- **SQLModel + AsyncSession + asyncpg** es el unico ORM/mecanismo para acceso a datos (queries, inserts, updates, deletes)
- En frontend, Supabase solo para auth; todo data access va via HTTP al backend FastAPI

## Backend (Python/FastAPI)

Enforced by `yantar_backend/tests/test_architecture.py`.

### Capas y Restricciones de Imports

```
+-----------------------------+
|  infrastructure/            |  <- Puede importar todo
|   http/      -> endpoints   |
|   persistence/ -> repos     |
+-----------------------------+
|  application/               |  <- NO frameworks
|   use cases, DTOs           |
+-----------------------------+
|  domain/                    |  <- NO frameworks
|   entities, ports, v.o.     |
+-----------------------------+
```

**Modulos prohibidos en domain/ y application/:**
```python
FRAMEWORK_MODULES = {
    "fastapi",
    "starlette",
    "httpx",
    "supabase",
    "postgrest",
    "uvicorn",
    "sqlmodel",
}
```

**Permitido en domain/application:**
- stdlib (uuid, datetime, typing, abc, enum, dataclasses)
- pydantic (para entidades — `app/shared/domain/entity.py` usa `BaseModel`)
- Tipos propios del dominio

### Estructura por Bounded Context

```
app/{domain}/
  domain/
    entities.py      # Entidades con logica de negocio (extienden Entity)
    ports.py         # Interfaces ABC (repositories, servicios externos)
    value_objects.py # Enums, tipos inmutables
    services.py      # Servicios de dominio (logica que no pertenece a una entidad)
    errors.py        # Errores de dominio (opcional, o usar shared)
  application/
    {use_case}.py    # Un archivo por use case, orquesta ports (ver use-case-patterns.md)
    dtos.py          # Request/Result DTOs (Pydantic models planos)
  infrastructure/
    http/
      endpoints.py   # FastAPI routers — traduce HTTP <-> DTOs, inyecta use cases
      {adapter}.py   # Adapters de servicios externos (pasarela pago, notificaciones)
    persistence/
      {repo}.py      # Implementaciones de repository ports (SQLModel + AsyncSession)
```

**Regla de subdivision de infrastructure/:**
- `http/` — todo lo que entra o sale por HTTP: endpoints, adapters de APIs externas, middleware
- `persistence/` — todo lo que toca base de datos: repositories SQLModel + AsyncSession, queries
- Si un adapter no es HTTP ni persistence (ej: push notifications, file storage), crear subcarpeta con nombre descriptivo

**Inyeccion de dependencias** — el endpoint construye el grafo:
```python
# infrastructure/http/endpoints.py
def _build_use_cases(db: AsyncSession):
    repo = SQLModelOrderRepo(db)
    notification_svc = PushNotificationAdapter(settings)
    return CreateOrderUseCase(order_repo=repo, notification_service=notification_svc)
```

### Cross-Domain Communication

**Regla**: Un dominio NO importa directamente de otro dominio. La comunicacion es a traves de **ports**.

Ejemplo canonico — Order necesita verificar puntos de Loyalty:

```python
# app/order/domain/ports.py
class ILoyaltyChecker(ABC):
    """Port for checking loyalty points (from Loyalty domain)."""
    @abstractmethod
    async def get_available_points(self, customer_id: UUID) -> int: ...
    @abstractmethod
    async def redeem_points(self, customer_id: UUID, points: int) -> None: ...

# app/order/infrastructure/loyalty_adapter.py (implementa el port)
from app.loyalty.application.check_points import CheckPointsUseCase

class LoyaltyCheckerAdapter(ILoyaltyChecker):
    async def get_available_points(self, customer_id):
        return await self.loyalty_use_case.execute(customer_id)
```

El adapter vive en **infrastructure/** del dominio consumidor, y puede importar del dominio proveedor.

### Errores de Dominio

Usar la jerarquia de `app/shared/domain/errors.py`:
```python
from app.shared.domain.errors import DomainError

class OrderNotFoundError(DomainError): ...
class InsufficientPointsError(DomainError): ...
class TableNotAvailableError(DomainError): ...
```

### Entity Base

Todas las entidades extienden `app/shared/domain/entity.py`:
```python
from app.shared.domain.entity import Entity

class Order(Entity):
    customer_id: UUID
    restaurant_id: UUID
    status: OrderStatus
    # ... business logic methods
```

### Multi-Tenancy

**Regla critica**: Toda query de datos DEBE filtrar por `restaurant_id`.

```python
# CORRECTO
async def get_orders(self, restaurant_id: UUID, customer_id: UUID) -> list[Order]:
    stmt = select(OrderModel).where(
        OrderModel.restaurant_id == restaurant_id,
        OrderModel.customer_id == customer_id
    )

# INCORRECTO — falta filtro de tenant
async def get_orders(self, customer_id: UUID) -> list[Order]:
    stmt = select(OrderModel).where(OrderModel.customer_id == customer_id)
```

---

## Frontend (Next.js/TypeScript)

Enforced by `yantar-frontend/domains/architecture.test.ts`.

### Capas y Restricciones

```
+-----------------------------+
|  ui/                        |  <- React components, puede importar todo
|   Component.tsx             |
+-----------------------------+
|  infrastructure/            |  <- Supabase (SOLO auth), fetch, Next.js
|   http/  -> api-adapter     |
|   queries/ -> server-queries|
+-----------------------------+
|  application/               |  <- React hooks OK, NO Supabase server
|   use-{feature}.ts, ports.ts|
+-----------------------------+
|  domain/                    |  <- TypeScript puro, NO React/Supabase/Next
|   types.ts, rules.ts       |
+-----------------------------+
```

**Prohibido en domain/:**
- `@supabase/*`
- `createSupabase*`
- `@/lib/supabase`
- `next/*`

**Prohibido en application/:**
- `@supabase/supabase-js`
- `createSupabaseServerClient`
- `@/lib/supabase/server`

### Compound Components Pattern

Para componentes con multiples piezas coordinadas, usar `Object.assign`:

```tsx
// Cart.tsx
function CartRoot({ children }: CartProps) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}

export const Cart = Object.assign(CartRoot, {
  Items: CartItems,
  Summary: CartSummary,
  Actions: CartActions,
  DeliverySelector: CartDeliverySelector,
})

// Usage:
<Cart>
  <Cart.Items />
  <Cart.Summary />
  <Cart.DeliverySelector />
  <Cart.Actions />
</Cart>
```

**Cuando usar compound components:**
- El componente tiene 3+ sub-componentes coordinados
- Comparten contexto (Provider pattern)
- El usuario necesita flexibilidad de composicion

### Shared UI Primitives

Viven en `components/ui/`. Agregar nuevas requiere justificacion:
- Es reutilizable en 2+ dominios?
- No existe ya en shadcn/ui?
- Encapsula un patron recurrente?

### Theming White-Label

Cada restaurante define su tema. Los componentes NUNCA usan colores hardcoded:
```typescript
// CORRECTO — usa variables de tema
className="bg-primary text-primary-foreground"

// INCORRECTO — color hardcoded
className="bg-red-500 text-white"
```

El tema se carga desde la configuracion del restaurante y se aplica via CSS custom properties.
