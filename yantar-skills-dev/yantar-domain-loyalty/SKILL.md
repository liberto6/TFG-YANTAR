---
name: yantar-domain-loyalty
description: >
  Documentacion viva del bounded context Loyalty: programa de fidelizacion,
  acumulacion de puntos, canjes, y reglas configurables por restaurante.
---

# Loyalty Domain

## Proposito

Gestiona el programa de fidelizacion de cada restaurante. Con cada pedido o visita el cliente acumula puntos que puede canjear por descuentos, productos gratuitos o beneficios exclusivos. Cada restaurante configura sus propias reglas.

## Mapa de Archivos

```
yantar_backend/app/loyalty/
+-- domain/
|   +-- entities.py          # LoyaltyAccount, PointsTransaction, Reward
|   +-- ports.py             # ILoyaltyAccountRepository, IRewardRepository, IPointsTransactionRepository
|   +-- value_objects.py     # TransactionType, RewardType, PointsBalance
|   +-- services.py          # PointsCalculationService (reglas de acumulacion)
|   +-- errors.py            # InsufficientPointsError, RewardNotAvailableError
+-- application/
|   +-- dtos.py              # LoyaltyAccountDTO, RedeemRequest/Result, etc.
|   +-- get_balance.py       # GetBalanceUseCase
|   +-- award_points.py      # AwardPointsUseCase (tras pedido completado)
|   +-- redeem_points.py     # RedeemPointsUseCase (canjear por descuento/reward)
|   +-- get_rewards.py       # GetAvailableRewardsUseCase
|   +-- get_history.py       # GetPointsHistoryUseCase
+-- infrastructure/
    +-- http/
    |   +-- endpoints.py          # /loyalty, /rewards routes
    +-- persistence/
        +-- sqlmodel_loyalty_repo.py   # ILoyaltyAccountRepository -> SQLModel
        +-- sqlmodel_reward_repo.py    # IRewardRepository -> SQLModel
```

## Entidades

### LoyaltyAccount
- **Campos**: `customer_id`, `restaurant_id`, `total_points_earned`, `total_points_redeemed`, `current_balance`, `tier`, `created_at`, `last_activity_at`
- **Logica**:
  - `can_redeem(points)` -> `current_balance >= points`
  - `award(points, reason)` -> incrementa balance y total_earned
  - `redeem(points, reason)` -> raises `InsufficientPointsError` si no alcanza
  - `update_tier()` -> recalcula tier basado en total_points_earned

### PointsTransaction
- **Campos**: `account_id`, `type` (EARNED/REDEEMED/EXPIRED/ADJUSTED), `points`, `reason`, `order_id?`, `reward_id?`, `created_at`
- **Inmutable** — historial de movimientos

### Reward
- **Campos**: `restaurant_id`, `name`, `description`, `type` (DISCOUNT_PERCENT/DISCOUNT_FIXED/FREE_ITEM/CUSTOM), `points_cost`, `value` (ej: 10% o 5 EUR o dish_id), `is_active`, `stock` (null = ilimitado), `valid_from`, `valid_until`
- **Logica**:
  - `is_available()` -> is_active AND (stock is null OR stock > 0) AND within date range
  - `consume()` -> decrementa stock si no es ilimitado

## Value Objects

- **TransactionType**: `EARNED`, `REDEEMED`, `EXPIRED`, `ADJUSTED`
- **RewardType**: `DISCOUNT_PERCENT`, `DISCOUNT_FIXED`, `FREE_ITEM`, `CUSTOM`
- **PointsBalance**: value object >= 0, con `add()` y `subtract()`
- **LoyaltyTier**: `BRONZE` (0-500), `SILVER` (500-2000), `GOLD` (2000-5000), `PLATINUM` (5000+) — configurable por restaurante

## Ports (Interfaces)

### ILoyaltyAccountRepository
```python
get_by_customer(customer_id, restaurant_id) -> LoyaltyAccount | None
get_or_create(customer_id, restaurant_id) -> LoyaltyAccount
save(account) -> None
```

### IPointsTransactionRepository
```python
create(transaction) -> PointsTransaction
get_history(account_id, limit, offset) -> list[PointsTransaction]
```

### IRewardRepository
```python
get_available(restaurant_id) -> list[Reward]
get_by_id(reward_id, restaurant_id) -> Reward | None
update(reward) -> Reward
```

## Servicios de Dominio

### PointsCalculationService (funciones puras)
- `calculate_points_for_order(order_total, rules)` -> int
  - Regla base: 1 punto por cada EUR gastado (configurable)
  - Multiplicadores: x2 en dias especiales, x1.5 para tier Gold+
- `calculate_discount_value(points, point_value)` -> Decimal
  - Valor por defecto: 1 punto = 0.01 EUR (configurable)

## Use Cases

### AwardPointsUseCase
**Dependencias**: ILoyaltyAccountRepository, IPointsTransactionRepository, PointsCalculationService
**Flujo**:
1. Get/create loyalty account para customer+restaurant
2. Calcular puntos segun reglas del restaurante
3. Award points al account
4. Crear transaction EARNED
5. Actualizar tier si aplica

### RedeemPointsUseCase
**Dependencias**: ILoyaltyAccountRepository, IRewardRepository, IPointsTransactionRepository
**Flujo**:
1. Cargar account y verificar balance
2. Si reward: verificar disponibilidad y consumir stock
3. Redeem points del account
4. Crear transaction REDEEMED
5. Retornar descuento/beneficio aplicable

### GetBalanceUseCase
Retorna: current_balance, tier, total_earned, available_rewards_count

### GetAvailableRewardsUseCase
Retorna: lista de rewards activos del restaurante con cost y disponibilidad

## Dependencias Cross-Domain

| Direccion | Port | Consumidor |
|-----------|------|-----------|
| Provee | ILoyaltyChecker (definido en Order) | Order — verificar/canjear puntos al pedir |
| Consume | Order completado | Trigger para AwardPointsUseCase |

## Tests

```
tests/loyalty/
+-- test_entities.py          # can_redeem, award, redeem, update_tier
+-- test_services.py          # PointsCalculationService
+-- test_award_points.py      # Use case
+-- test_redeem_points.py     # Use case
+-- test_get_balance.py       # Use case
```

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- Reglas de puntos (ratio EUR->puntos, multiplicadores) configurables por restaurante — necesita config store
- Expiracion de puntos (ej: caducan a los 12 meses) — pendiente de implementar
- Considerar eventos de dominio: OrderCompletedEvent -> AwardPointsUseCase
