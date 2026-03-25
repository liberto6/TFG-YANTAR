# TDD Workflow — Yantar

## Secuencia Obligatoria

### Paso 1: Identificar dominio(s) afectados
Consultar el skill de dominio para entender entidades, ports y use cases existentes.

### Paso 2: Escribir test PRIMERO

**Backend** — en `yantar_backend/tests/{domain}/test_{feature}.py`:

```python
# tests/order/test_create_order.py
import pytest
from unittest.mock import AsyncMock
from uuid import uuid4

from app.order.application.create_order import CreateOrderUseCase
from app.order.domain.entities import Order
from app.order.domain.value_objects import OrderStatus, DeliveryMode


@pytest.mark.asyncio
async def test_create_order_calculates_total_and_persists(
    mock_order_repo, mock_menu_repo, mock_loyalty_checker
):
    """Given a cart with valid items, creating an order calculates total and saves."""
    customer_id = uuid4()
    restaurant_id = uuid4()

    use_case = CreateOrderUseCase(
        order_repo=mock_order_repo,
        menu_repo=mock_menu_repo,
        loyalty_checker=mock_loyalty_checker,
    )

    result = await use_case.execute(
        customer_id=customer_id,
        restaurant_id=restaurant_id,
        items=[{"dish_id": uuid4(), "quantity": 2, "customizations": []}],
        delivery_mode=DeliveryMode.DINE_IN,
    )

    assert result.status == OrderStatus.PENDING
    assert result.total > 0
    mock_order_repo.save.assert_called_once()
```

**Frontend** — colocado junto al modulo `{module}.test.ts`:

```typescript
// domains/order/application/use-cart.test.ts
import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCart } from "./use-cart"

describe("useCart", () => {
  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart())
    expect(result.current.items).toEqual([])
    expect(result.current.total).toBe(0)
  })

  it("adds item and recalculates total", () => {
    const { result } = renderHook(() => useCart())
    act(() => result.current.addItem({ dishId: "1", name: "Paella", price: 12.50, quantity: 1 }))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.total).toBe(12.50)
  })
})
```

### Paso 3: Ejecutar test -> confirmar que FALLA

```bash
# Backend
cd yantar_backend && python -m pytest tests/{domain}/test_{feature}.py -v

# Frontend
cd yantar-frontend && npx vitest run {path-to-test}
```

El test DEBE fallar con un error claro (import error o assertion failure, NO syntax error).

### Paso 4: Implementar capa por capa

**Orden backend:**
1. `domain/entities.py` — entidades con logica de negocio
2. `domain/value_objects.py` — enums, tipos
3. `domain/ports.py` — interfaces ABC
4. `domain/services.py` — servicios de dominio (si aplica)
5. `application/dtos.py` — Request/Result DTOs
6. `application/{use_case}.py` — orquestacion (ver `use-case-patterns.md`)
7. `infrastructure/persistence/{repo}.py` — implementacion de repository ports
8. `infrastructure/http/endpoints.py` — routers FastAPI, inyeccion de use cases
9. `infrastructure/http/{adapter}.py` — adapters de servicios externos (si aplica)

**Orden frontend:**
1. `domain/types.ts` — tipos TypeScript puros
2. `domain/rules.ts` — logica de negocio pura (si aplica)
3. `application/ports.ts` — interfaces
4. `application/use-{feature}.ts` — hooks (ver `use-case-patterns.md`)
5. `infrastructure/http/api-adapter.ts` — adapters HTTP
6. `infrastructure/queries/server-queries.ts` — server-side queries
7. `ui/{Component}.tsx` — componentes

### Paso 5: Ejecutar test -> confirmar que PASA

```bash
# Backend
cd yantar_backend && python -m pytest tests/{domain}/test_{feature}.py -v

# Frontend
cd yantar-frontend && npx vitest run {path-to-test}
```

### Paso 6: Refactorizar

- Extraer value objects si hay logica repetida
- Consolidar imports
- Verificar naming conventions

### Paso 7: Ejecutar tests de fitness arquitectonica

```bash
# Backend — verifica que domain/application no importan frameworks
cd yantar_backend && python -m pytest tests/test_architecture.py -v

# Frontend — verifica que domain no importa Supabase/Next.js
cd yantar-frontend && npx vitest run domains/architecture.test.ts
```

Si los tests de fitness fallan, hay una violacion arquitectonica que debe corregirse antes de continuar.

---

## Fixtures y Mocks (Backend)

Usar las factories de `tests/conftest.py`:

```python
from tests.conftest import make_order, make_dish, make_reservation

# Crear entidades de test
order = make_order(status=OrderStatus.PENDING, customer_id=customer_id)
dish = make_dish(name="Paella", price=Decimal("12.50"))
```

Mock repositories son fixtures de pytest:
- `mock_order_repo` — AsyncMock de IOrderRepository
- `mock_menu_repo` — AsyncMock de IMenuRepository
- `mock_dish_repo` — AsyncMock de IDishRepository
- `mock_loyalty_checker` — AsyncMock de ILoyaltyChecker
- `mock_reservation_repo` — AsyncMock de IReservationRepository
- `mock_restaurant_repo` — AsyncMock de IRestaurantRepository
- `mock_allergen_repo` — AsyncMock de IAllergenRepository

---

## Convenciones de Naming

| Tipo | Backend | Frontend |
|------|---------|----------|
| Test file | `test_{feature}.py` | `{module}.test.ts` |
| Test class | `TestFeatureName` | `describe("FeatureName")` |
| Test method | `test_scenario_expected_result` | `it("does something when condition")` |
| Fixture | `mock_{dependency}` | — |
| Use case | `{Verb}{Noun}UseCase` | `use-{feature}.ts` |
