---
name: yantar-domain-order
description: >
  Documentacion viva del bounded context Order: carrito de compra,
  pedidos, lifecycle de estados, modalidades de entrega, y notificaciones.
---

# Order Domain

## Proposito

Gestiona el ciclo de vida completo de pedidos: desde la creacion del carrito hasta la entrega/recogida. Soporta tres modalidades (en mesa, recogida, domicilio) y notifica al restaurante en tiempo real.

## Mapa de Archivos

```
yantar_backend/app/order/
+-- domain/
|   +-- entities.py          # Order, OrderItem, Cart
|   +-- ports.py             # IOrderRepository, INotificationService, ILoyaltyChecker, IPaymentGateway
|   +-- value_objects.py     # OrderStatus, DeliveryMode, OrderItemCustomization
|   +-- services.py          # PricingService (calculos de total, descuentos)
|   +-- errors.py            # OrderNotFoundError, EmptyCartError, etc.
+-- application/
|   +-- dtos.py              # CreateOrderRequest/Result, OrderStatusDTO, etc.
|   +-- create_order.py      # CreateOrderUseCase
|   +-- confirm_order.py     # ConfirmOrderUseCase (restaurante acepta)
|   +-- cancel_order.py      # CancelOrderUseCase
|   +-- update_order_status.py # UpdateOrderStatusUseCase (preparando, listo, entregado)
|   +-- get_order.py         # GetOrderUseCase
|   +-- get_order_history.py # GetOrderHistoryUseCase
+-- infrastructure/
    +-- http/
    |   +-- endpoints.py          # /orders routes
    |   +-- notification_adapter.py  # Push notifications al restaurante
    |   +-- payment_adapter.py       # Pasarela de pago (si aplica)
    +-- persistence/
        +-- sqlmodel_order_repo.py   # IOrderRepository -> SQLModel
```

## Entidades

### Order
- **Campos**: `customer_id`, `restaurant_id`, `status`, `delivery_mode`, `items[]`, `subtotal`, `discount`, `total`, `notes`, `table_number` (si DINE_IN), `delivery_address` (si DELIVERY), `estimated_time_minutes`, `created_at`, `confirmed_at`, `completed_at`
- **Estados**: `PENDING -> CONFIRMED -> PREPARING -> READY -> COMPLETED` (o `CANCELLED`)
- **Logica**:
  - `confirm()` -> PENDING -> CONFIRMED (raises si wrong state)
  - `start_preparing()` -> CONFIRMED -> PREPARING
  - `mark_ready()` -> PREPARING -> READY
  - `complete()` -> READY -> COMPLETED
  - `cancel(reason)` -> solo desde PENDING o CONFIRMED
  - `calculate_total(dishes)` -> suma precios * cantidades - descuentos
  - `apply_points_discount(available_points, redeem_points)` -> aplica descuento
  - `is_cancellable()` -> true si PENDING o CONFIRMED
  - `is_active()` -> true si no COMPLETED ni CANCELLED

### OrderItem
- **Campos**: `dish_id`, `dish_name`, `quantity`, `unit_price`, `customizations[]`, `notes`
- **Logica**: `line_total()` -> `unit_price * quantity`

### Cart (Value Object / Transient)
- **Campos**: `restaurant_id`, `items[]`, `delivery_mode`
- **Logica**:
  - `add_item(item)` -> agrega o incrementa cantidad
  - `remove_item(dish_id)` -> elimina
  - `update_quantity(dish_id, quantity)` -> actualiza
  - `is_empty()` -> true si no items
  - `item_count()` -> suma de cantidades

## Value Objects

- **OrderStatus**: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`
- **DeliveryMode**: `DINE_IN` (en mesa), `PICKUP` (recogida), `DELIVERY` (domicilio)
- **OrderItemCustomization**: `name` (ej: "sin cebolla"), `type` (REMOVE/ADD/REPLACE), `extra_price`

## Ports (Interfaces)

### IOrderRepository
```python
get_by_id(order_id, restaurant_id) -> Order | None
get_by_customer(customer_id, restaurant_id) -> list[Order]
get_active_by_customer(customer_id, restaurant_id) -> Order | None
get_history(customer_id, restaurant_id, limit, offset) -> list[Order]
save(order) -> Order
update_status(order_id, status) -> Order
```

### INotificationService
```python
notify_new_order(order) -> None        # Push al restaurante
notify_order_ready(order) -> None      # Push al cliente
notify_order_cancelled(order) -> None  # Push a ambos
```

### ILoyaltyChecker (cross-domain — del dominio Loyalty)
```python
get_available_points(customer_id) -> int
redeem_points(customer_id, points) -> None
award_points(customer_id, order_total) -> int  # retorna puntos otorgados
```

### IPaymentGateway (opcional)
```python
create_payment_intent(order_id, amount) -> PaymentIntent
confirm_payment(payment_id) -> bool
```

## Servicios de Dominio

### PricingService (funciones puras)
- `calculate_subtotal(items[])` -> Decimal
- `calculate_discount(subtotal, points_to_redeem, point_value)` -> Decimal
- `calculate_total(subtotal, discount)` -> Decimal

## Dependencias Cross-Domain

| Direccion | Port | Dominio Proveedor |
|-----------|------|--------------------|
| Consume | `ILoyaltyChecker` | Loyalty |
| Consume | `IMenuReader` | Menu (validar platos/precios) |
| Provee | Pedidos completados | Loyalty (para otorgar puntos) |

## Tests

```
tests/order/
+-- test_entities.py          # State machine, calculate_total, is_cancellable
+-- test_pricing_service.py   # Calculos de precio puros
+-- test_create_order.py      # Use case
+-- test_confirm_order.py     # Use case
+-- test_cancel_order.py      # Use case
```

**Fixtures en `tests/conftest.py`**: `mock_order_repo`, `mock_notification_service`, `mock_loyalty_checker`

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- El flujo de pago (PaymentGateway) es opcional en MVP — depende de requisitos del restaurante
- `estimated_time_minutes` podria calcularse con ML basado en historial (future)
- Considerar eventos de dominio para desacoplar notificaciones (OrderCreatedEvent, OrderReadyEvent)
