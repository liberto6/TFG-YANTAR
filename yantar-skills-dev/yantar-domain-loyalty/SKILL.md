---
name: yantar-domain-loyalty
description: >
  Documentacion viva del bounded context Loyalty: programa de fidelizacion,
  acumulacion de puntos, canjes por descuentos, y reglas configurables por empresa.
---

# Loyalty Domain

## Proposito

Gestiona el programa de fidelizacion de cada empresa. Con cada pedido el cliente acumula puntos que puede canjear por descuentos. Cada empresa configura sus propias reglas (puntos por euro, recompensas). Los puntos son GLOBALES entre sedes de una misma empresa.

## Mapa de Archivos

```
apps/backend/src/loyalty/
├── domain/
│   ├── entities/
│   │   ├── loyalty-account.entity.ts    # Cuenta de puntos del cliente
│   │   ├── points-transaction.entity.ts # Historial de movimientos
│   │   └── reward.entity.ts             # Recompensa canjeable
│   ├── ports/
│   │   ├── loyalty-account-repository.port.ts
│   │   ├── reward-repository.port.ts
│   │   └── points-transaction-repository.port.ts
│   ├── value-objects/
│   │   ├── transaction-type.enum.ts     # EARNED, REDEEMED
│   │   └── reward-type.enum.ts          # DISCOUNT_PERCENT, DISCOUNT_FIXED, FREE_ITEM
│   ├── services/
│   │   └── points-calculation.service.ts # Reglas de acumulacion
│   └── errors/
│       ├── insufficient-points.error.ts
│       └── reward-not-available.error.ts
├── application/
│   ├── services/
│   │   ├── get-balance.service.ts
│   │   ├── award-points.service.ts       # Tras pedido completado
│   │   ├── redeem-points.service.ts      # Canjear por descuento
│   │   ├── get-rewards.service.ts        # Recompensas disponibles
│   │   └── get-points-history.service.ts
│   └── dtos/
│       ├── loyalty-account.dto.ts
│       ├── reward.dto.ts
│       └── redeem.dto.ts
├── infrastructure/
│   ├── controllers/
│   │   ├── loyalty.controller.ts          # /loyalty routes (customer)
│   │   └── admin-loyalty.controller.ts    # /admin/loyalty routes
│   └── repositories/
│       ├── prisma-loyalty-account.repository.ts
│       ├── prisma-reward.repository.ts
│       └── prisma-points-transaction.repository.ts
└── loyalty.module.ts
```

## Entidades

### LoyaltyAccount
- **Campos**: `id`, `customerId`, `companyId`, `totalPointsEarned`, `totalPointsRedeemed`, `currentBalance`, `createdAt`, `lastActivityAt`
- **Logica**:
  - `canRedeem(points)` → currentBalance >= points
  - `award(points, reason)` → incrementa balance y totalEarned
  - `redeem(points, reason)` → throws InsufficientPointsError si no alcanza

### PointsTransaction
- **Campos**: `id`, `accountId`, `type` (EARNED/REDEEMED), `points`, `reason`, `orderId?`, `rewardId?`, `createdAt`
- **Inmutable** — historial de movimientos

### Reward (Recompensa)
- **Campos**: `id`, `companyId`, `name`, `description`, `type` (DISCOUNT_PERCENT/DISCOUNT_FIXED/FREE_ITEM), `pointsCost`, `value` (ej: 10% o 5€ o dishId), `isActive`, `stock` (null = ilimitado), `validFrom`, `validUntil`
- **Logica**:
  - `isAvailable()` → isActive AND (stock null OR stock > 0) AND within dates
  - `consume()` → decrementa stock si no es ilimitado

## Value Objects

- **TransactionType**: `EARNED`, `REDEEMED`
- **RewardType**: `DISCOUNT_PERCENT`, `DISCOUNT_FIXED`, `FREE_ITEM`

## Ports (Interfaces)

### ILoyaltyAccountRepository
```typescript
getByCustomer(customerId: string, companyId: string): Promise<LoyaltyAccount | null>
getOrCreate(customerId: string, companyId: string): Promise<LoyaltyAccount>
save(account: LoyaltyAccount): Promise<void>
```

### IRewardRepository
```typescript
getAvailable(companyId: string): Promise<Reward[]>
getById(rewardId: string, companyId: string): Promise<Reward | null>
update(reward: Reward): Promise<Reward>
create(reward: Reward): Promise<Reward>
```

### IPointsTransactionRepository
```typescript
create(transaction: PointsTransaction): Promise<PointsTransaction>
getHistory(accountId: string, limit?: number, offset?: number): Promise<PointsTransaction[]>
```

## Servicios de Dominio

### PointsCalculationService (funciones puras)
- `calculatePointsForOrder(orderTotal, rules)` → number
  - Regla base: configurable por empresa (ej: 1 punto por euro)
- `calculateDiscountValue(points, pointValue)` → number
  - Valor configurable por empresa (ej: 1 punto = 0.01€)

## Dependencias Cross-Domain

| Direccion | Port | Consumidor |
|-----------|------|-----------|
| Provee | ILoyaltyChecker (definido en Order) | Order — verificar/canjear puntos al pedir |
| Consume | Order completado | Trigger para AwardPointsService |

## Notas

- Puntos GLOBALES entre sedes de la misma empresa
- Reglas de puntos (ratio EUR→puntos) configurables por empresa
- El admin crea/edita recompensas desde el panel admin
- Expiracion de puntos — pendiente, no en MVP
