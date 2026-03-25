# Use Case Patterns — Yantar

## Que es un Use Case

Un use case es el **unico punto de entrada** a la logica de negocio para una operacion concreta.
Orquesta ports (interfaces) — no contiene logica de negocio ni conoce frameworks.

### Responsabilidades

| Si hace | No hace |
|---------|---------|
| Orquestar ports en orden | Logica de negocio (-> domain service) |
| Validar precondiciones de flujo | Validar reglas de negocio (-> entidad) |
| Mapear DTOs <-> entidades | Acceder a BD/HTTP/frameworks |
| Levantar errores de dominio | Manejar HTTP status codes (-> endpoint) |
| Logging de operacion | Serializacion de respuesta HTTP |

**Regla de oro**: si la logica tiene sentido sin saber quien la llama (endpoint, webhook, CLI), pertenece al use case o mas abajo. Si depende de HTTP -> endpoint. Si es regla de negocio pura -> domain service/entity.

---

## Backend (Python)

### Estructura canonica

Un archivo por use case: `app/{domain}/application/{verb}_{noun}.py`

```python
# app/order/application/create_order.py
from uuid import UUID
from decimal import Decimal

from app.order.domain.ports import IOrderRepository, INotificationService
from app.order.domain.entities import Order
from app.order.application.dtos import CreateOrderRequest, CreateOrderResult


class CreateOrderUseCase:
    """Orquesta la creacion de un pedido."""

    def __init__(
        self,
        order_repo: IOrderRepository,
        menu_repo: IMenuRepository,
        loyalty_checker: ILoyaltyChecker,
        notification_service: INotificationService,
    ) -> None:
        self._order_repo = order_repo
        self._menu_repo = menu_repo
        self._loyalty_checker = loyalty_checker
        self._notification_service = notification_service

    async def execute(self, request: CreateOrderRequest) -> CreateOrderResult:
        # 1. Validar que los platos existen y obtener precios
        dishes = await self._menu_repo.get_dishes_by_ids(request.dish_ids)
        if len(dishes) != len(request.dish_ids):
            raise DishNotFoundError("Uno o mas platos no encontrados")

        # 2. Crear entidad (logica de negocio en la entidad)
        order = Order.create(
            customer_id=request.customer_id,
            restaurant_id=request.restaurant_id,
            items=request.items,
            delivery_mode=request.delivery_mode,
        )

        # 3. Calcular total (domain service o entidad)
        order.calculate_total(dishes)

        # 4. Aplicar descuento por puntos si aplica
        if request.redeem_points:
            available = await self._loyalty_checker.get_available_points(request.customer_id)
            order.apply_points_discount(available, request.redeem_points)

        # 5. Persistir via port
        await self._order_repo.save(order)

        # 6. Notificar al restaurante
        await self._notification_service.notify_new_order(order)

        # 7. Retornar DTO de resultado
        return CreateOrderResult(order_id=order.id, total=order.total, status=order.status)
```

### Reglas

1. **Un archivo, una clase, un `execute()`** — nombre: `{Verb}{Noun}UseCase`
2. **Constructor recibe ports** — nunca implementaciones concretas
3. **`execute()` es async** — recibe un DTO de request, retorna un DTO de result
4. **Sin imports de framework** — prohibido: fastapi, starlette, httpx, supabase, sqlmodel
5. **Errores de dominio** — levantar `DomainError` y subclases, nunca `HTTPException`
6. **Sin side-effects ocultos** — todo pasa por ports explicitos

### DTOs

Viven en `app/{domain}/application/dtos.py`. Son Pydantic models planos:

```python
# app/order/application/dtos.py
from pydantic import BaseModel, Field
from uuid import UUID
from decimal import Decimal


class CreateOrderRequest(BaseModel):
    customer_id: UUID
    restaurant_id: UUID
    items: list[OrderItemRequest]
    delivery_mode: str
    redeem_points: int = 0
    notes: str = ""


class CreateOrderResult(BaseModel):
    order_id: UUID
    total: Decimal
    status: str
    estimated_time_minutes: int | None = None
```

**Reglas de DTOs:**
- Sin logica de validacion de negocio (eso va en la entidad)
- `Field()` solo para constraints de formato (min_length, regex)
- Request y Result separados — nunca reusar la entidad como DTO
- El endpoint mapea HTTP request -> DTO request, y DTO result -> HTTP response

### Cuando Use Case vs Domain Service

| Situacion | Donde va |
|-----------|----------|
| Orquestar multiples ports | **Use Case** |
| Calcular precio total con descuentos | **Domain Service** o metodo de entidad |
| Logica que no depende de estado externo | **Domain Service** |
| Logica que necesita I/O (BD, API) | **Use Case** (orquesta ports) |
| Regla que pertenece a una sola entidad | **Metodo de entidad** |

Ejemplo: `calculate_total()` es metodo de entidad o domain service. `CreateOrderUseCase` es use case (necesita leer platos de BD via port, notificar).

### Manejo de Errores

```python
# En el use case — levantar errores de dominio
from app.shared.domain.errors import NotFoundError, InsufficientPointsError

async def execute(self, request):
    order = await self._order_repo.find_by_id(request.order_id)
    if not order:
        raise NotFoundError(f"Order {request.order_id}")
    ...

# En el endpoint — traducir a HTTP
@router.post("/orders")
async def create_order(...):
    try:
        result = await use_case.execute(request)
        return result
    except InsufficientPointsError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
```

### Idempotencia

Para use cases llamados desde webhooks o procesos que reintentan:

```python
async def execute(self, request):
    existing = await self._repo.find_by_id(request.id)
    if existing and existing.is_processed:
        return None  # Ya procesado, no-op
    ...
```

---

## Frontend (TypeScript/React)

### Estructura canonica

Un archivo por hook: `domains/{domain}/application/use-{feature}.ts`

```typescript
// domains/order/application/use-cart.ts
import { useCallback, useMemo, useState } from "react"
import type { IOrderApi } from "./ports"
import type { CartItem, CartSummary } from "../domain/types"

export function useCart(orderApi: IOrderApi) {
  const [items, setItems] = useState<CartItem[]>([])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.dishId === item.dishId)
      if (existing) {
        return prev.map(i =>
          i.dishId === item.dishId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((dishId: string) => {
    setItems(prev => prev.filter(i => i.dishId !== dishId))
  }, [])

  const submitOrder = useCallback(async () => {
    return orderApi.createOrder({ items })
  }, [orderApi, items])

  return { items, total, addItem, removeItem, submitOrder }
}
```

### Reglas

1. **Un archivo, un hook** — nombre: `use-{feature}.ts`
2. **Ports como parametros** — recibe interfaces, no implementaciones
3. **Prohibido**: `@supabase/supabase-js`, `createSupabaseServerClient`, `@/lib/supabase/server`
4. **Permitido**: React hooks (`useState`, `useCallback`, `useMemo`, `useRef`), tipos del dominio
5. **Sin UI** — no retorna JSX, solo datos y handlers
6. **Tests colocados** — `use-{feature}.test.ts` junto al hook

### Ports

Viven en `domains/{domain}/application/ports.ts`:

```typescript
// domains/order/application/ports.ts
export interface IOrderApi {
  createOrder(params: { items: CartItem[] }): Promise<CreateOrderResult>
  getOrderStatus(orderId: string): Promise<OrderStatus>
}

export interface IMenuApi {
  getDishes(restaurantId: string, filters?: DishFilters): Promise<Dish[]>
  getDishDetail(dishId: string): Promise<DishDetail>
}
```

### State Management en hooks

```typescript
// Patron para hooks con estado complejo
export function useMenuBrowser(initialDishes: Dish[]) {
  // Estado local
  const [dishes] = useState<Dish[]>(initialDishes)
  const [category, setCategory] = useState<string>("all")
  const [allergenFilters, setAllergenFilters] = useState<string[]>([])

  // Estado derivado
  const filteredDishes = useMemo(() =>
    dishes
      .filter(d => category === "all" || d.category === category)
      .filter(d => allergenFilters.every(a => !d.allergens.includes(a))),
    [dishes, category, allergenFilters]
  )

  return { dishes: filteredDishes, category, setCategory, allergenFilters, setAllergenFilters }
}
```
