---
name: yantar-domain-frontend-profile
description: >
  Documentacion viva del dominio frontend Profile: perfil de usuario,
  historial de pedidos, puntos de fidelizacion, y preferencias.
---

# Frontend Profile Domain

## Proposito

Muestra el perfil del cliente con su historial de pedidos, puntos de fidelizacion acumulados, y preferencias alimentarias (alergenos guardados). Permite gestionar datos personales y canjear recompensas.

## Mapa de Archivos

```
yantar-frontend/domains/profile/
+-- domain/
|   +-- types.ts                    # LoyaltyInfo, OrderHistoryItem
|   +-- rules.ts                    # canRedeem(), getTierName(), getNextTierProgress()
|   +-- rules.test.ts
+-- application/
|   +-- ports.ts                    # IProfileApi, ILoyaltyApi
|   +-- use-profile-summary.ts     # Hook de resumen del perfil
|   +-- use-profile-summary.test.ts
|   +-- use-loyalty.ts             # Hook de puntos y recompensas
|   +-- use-loyalty.test.ts
|   +-- use-order-history.ts       # Hook de historial de pedidos
|   +-- use-order-history.test.ts
|   +-- use-preferences.ts        # Hook de preferencias (alergenos, idioma)
|   +-- use-preferences.test.ts
+-- infrastructure/
|   +-- http/
|   |   +-- profile-api-adapter.ts  # IProfileApi -> HTTP
|   |   +-- loyalty-api-adapter.ts  # ILoyaltyApi -> HTTP
|   +-- queries/
|       +-- server-queries.ts       # Server-side queries
+-- ui/
    +-- ProfileSummary.tsx          # Vista resumen del perfil
    +-- LoyaltyCard.tsx             # Tarjeta de puntos/tier
    +-- LoyaltyCard.Balance.tsx     # Saldo de puntos
    +-- LoyaltyCard.Tier.tsx        # Nivel actual y progreso
    +-- LoyaltyCard.Rewards.tsx     # Recompensas disponibles
    +-- OrderHistory.tsx            # Lista de pedidos anteriores
    +-- PreferencesEditor.tsx       # Editor de preferencias alimentarias
```

## Types (domain/types.ts)

### LoyaltyInfo
```typescript
type LoyaltyInfo = {
  currentBalance: number
  totalEarned: number
  tier: LoyaltyTier
  nextTierThreshold: number
  pointsToNextTier: number
  availableRewards: Reward[]
}
```

### LoyaltyTier
```typescript
type LoyaltyTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
```

### Reward
```typescript
type Reward = {
  id: string
  name: string
  description: string
  pointsCost: number
  type: "DISCOUNT_PERCENT" | "DISCOUNT_FIXED" | "FREE_ITEM"
  value: string  // "10%" or "5.00" or dish name
  isAvailable: boolean
}
```

### OrderHistoryItem
```typescript
type OrderHistoryItem = {
  id: string
  date: string
  restaurantName: string
  items: { name: string; quantity: number }[]
  total: number
  status: OrderStatus
  deliveryMode: DeliveryMode
  pointsEarned: number
}
```

## Rules (Predicados puros)

- `canRedeem(balance, cost)` -> balance >= cost
- `getTierName(tier)` -> nombre localizado del tier
- `getNextTierProgress(totalEarned, tier)` -> porcentaje 0-100
- `getTierBenefits(tier)` -> lista de beneficios del tier

## Ports

### IProfileApi
```typescript
getProfileSummary(restaurantId: string): Promise<ProfileSummary>
updateProfile(data: UpdateProfileData): Promise<void>
updatePreferences(prefs: UserPreferences): Promise<void>
```

### ILoyaltyApi
```typescript
getLoyaltyInfo(restaurantId: string): Promise<LoyaltyInfo>
redeemReward(rewardId: string): Promise<RedeemResult>
getPointsHistory(restaurantId: string): Promise<PointsTransaction[]>
```

## Hooks

### useProfileSummary(restaurantId)
**State**: profile, loading
**Data**: nombre, email, pedidos totales, puntos, tier

### useLoyalty(restaurantId)
**State**: loyaltyInfo, loading
**Handlers**: redeemReward(rewardId)
**Computed**: canRedeemAny (hay al menos 1 reward asequible)

### useOrderHistory(restaurantId)
**State**: orders[], loading, hasMore
**Handlers**: loadMore() (paginacion)

### usePreferences()
**State**: excludedAllergens[], language
**Handlers**: toggleAllergen, setLanguage, save

## Compound Components

### LoyaltyCard
```tsx
<LoyaltyCard restaurantId={restaurantId}>
  <LoyaltyCard.Balance />
  <LoyaltyCard.Tier />
  <LoyaltyCard.Rewards />
</LoyaltyCard>
```

## Tests

| Archivo | Que prueba |
|---------|-----------|
| `rules.test.ts` | canRedeem, getNextTierProgress, getTierName |
| `use-loyalty.test.ts` | Balance, redeem flow |
| `use-order-history.test.ts` | Paginacion, load more |
| `use-preferences.test.ts` | Toggle allergens, save |

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- Tier names hardcoded — necesitan i18n
- Historial cross-restaurant (un cliente puede tener pedidos en varios restaurantes)
- Paginacion de historial — considerar infinite scroll vs paginas
