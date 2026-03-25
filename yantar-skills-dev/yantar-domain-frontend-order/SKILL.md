---
name: yantar-domain-frontend-order
description: >
  Documentacion viva del dominio frontend Order: UI de carrito, pedido,
  compound components, state machine de pedido, y seguimiento en tiempo real.
---

# Frontend Order Domain

## Proposito

Gestiona toda la UI del flujo de pedido: carrito de compra, personalizacion de platos, seleccion de modalidad (mesa/recogida/delivery), confirmacion, y seguimiento del estado del pedido. Es el dominio frontend mas complejo.

## Mapa de Archivos

```
yantar-frontend/domains/order/
+-- domain/
|   +-- types.ts                    # CartItem, OrderState, DeliveryMode, etc.
|   +-- state-machine.ts            # transition() — maquina de estados del pedido
|   +-- state-machine.test.ts       # Tests exhaustivos de transiciones
|   +-- rules.ts                    # canCheckout(), canCancel(), isActive()
|   +-- rules.test.ts               # Tests de predicados
+-- application/
|   +-- ports.ts                    # IOrderApi, ICartStorage
|   +-- use-cart.ts                 # Hook de gestion de carrito
|   +-- use-cart.test.ts
|   +-- use-checkout.ts             # Hook de checkout (crear pedido)
|   +-- use-checkout.test.ts
|   +-- use-order-tracking.ts       # Hook de seguimiento de estado
|   +-- use-order-tracking.test.ts
|   +-- use-order-history.ts        # Hook de historial de pedidos
|   +-- use-order-history.test.ts
+-- infrastructure/
|   +-- http/
|   |   +-- api-adapter.ts          # IOrderApi -> HTTP calls
|   |   +-- api-adapter.test.ts
|   +-- storage/
|       +-- cart-storage.ts          # ICartStorage -> localStorage
+-- ui/
    +-- Cart.tsx                     # Compound component root (Object.assign)
    +-- CartProvider.tsx             # Context provider (cart state + handlers)
    +-- Cart.Items.tsx               # Lista de items del carrito
    +-- Cart.Summary.tsx             # Resumen: subtotal, descuento, total
    +-- Cart.DeliverySelector.tsx    # Selector de modalidad
    +-- Cart.Actions.tsx             # Botones: seguir pidiendo, checkout
    +-- OrderStatus.tsx              # Compound component de seguimiento
    +-- OrderStatusProvider.tsx
    +-- OrderStatus.Progress.tsx     # Barra de progreso visual
    +-- OrderStatus.Details.tsx      # Detalles del pedido
    +-- OrderStatus.Timer.tsx        # Tiempo estimado
```

## Types

### CartItem
```typescript
type CartItem = {
  dishId: string
  name: string
  price: number
  quantity: number
  customizations: Customization[]
  notes: string
  imageUrl?: string
}
```

### OrderState
```typescript
type OrderState = {
  status: "idle" | "reviewing" | "submitting" | "confirmed" | "tracking" | "completed" | "error"
  orderId: string | null
  orderStatus: OrderStatus | null  // from backend
  estimatedMinutes: number | null
  error: string | null
}
```

### OrderStatus (from backend)
```typescript
type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED"
```

### DeliveryMode
```typescript
type DeliveryMode = "DINE_IN" | "PICKUP" | "DELIVERY"
```

## State Machine

Funcion pura `transition(state, event) -> newState`:

```
idle --ITEMS_ADDED--> reviewing
reviewing --CHECKOUT_REQUESTED--> submitting
reviewing --CART_EMPTIED--> idle
submitting --ORDER_CONFIRMED--> confirmed
submitting --ERROR--> error
confirmed --TRACKING_STARTED--> tracking
tracking --STATUS_UPDATED--> tracking (actualiza orderStatus)
tracking --ORDER_COMPLETED--> completed
completed --NEW_ORDER--> idle
error --RETRY--> submitting
error --RESET--> idle
```

## Rules (Predicados puros)

- `canCheckout(state)` -> true si reviewing y cart no vacio
- `canCancel(state)` -> true si confirmed (PENDING o CONFIRMED del backend)
- `isActive(state)` -> true si tracking
- `isCompleted(state)` -> true si completed
- `needsDeliveryAddress(mode)` -> true si DELIVERY

## Ports (application/ports.ts)

### IOrderApi
```typescript
createOrder(params: CreateOrderParams): Promise<CreateOrderResult>
getOrderStatus(orderId: string): Promise<OrderStatusResponse>
cancelOrder(orderId: string): Promise<void>
getOrderHistory(restaurantId: string): Promise<OrderHistoryItem[]>
```

### ICartStorage
```typescript
save(restaurantId: string, items: CartItem[]): void
load(restaurantId: string): CartItem[]
clear(restaurantId: string): void
```

## Hooks (Use Cases)

### useCart
**State**: items[], deliveryMode, notes
**Computed**: subtotal, itemCount, isEmpty
**Handlers**: addItem, removeItem, updateQuantity, setDeliveryMode, clear
**Persistencia**: guarda en localStorage via ICartStorage (carrito sobrevive a refresh)

### useCheckout
**Dependencias**: IOrderApi
**Flujo**:
1. Validar carrito no vacio
2. Llamar createOrder con items + deliveryMode + puntos a canjear
3. Dispatch ORDER_CONFIRMED con orderId
4. Limpiar carrito

### useOrderTracking
**Dependencias**: IOrderApi
**Flujo**: Polling cada 10s del estado del pedido. Actualiza status y estimatedMinutes.

### useOrderHistory
**Dependencias**: IOrderApi
**Flujo**: Carga historial paginado de pedidos anteriores.

## Compound Components

### Cart (Object.assign pattern)
```tsx
<Cart restaurantId={restaurantId}>
  <Cart.Items />
  <Cart.Summary />
  <Cart.DeliverySelector />
  <Cart.Actions />
</Cart>
```

### OrderStatus
```tsx
<OrderStatus orderId={orderId}>
  <OrderStatus.Progress />
  <OrderStatus.Timer />
  <OrderStatus.Details />
</OrderStatus>
```

## Tests

| Archivo | Que prueba |
|---------|-----------|
| `state-machine.test.ts` | Todas las transiciones (puro, sin React) |
| `rules.test.ts` | canCheckout, canCancel, isActive |
| `use-cart.test.ts` | Add/remove/update, persistencia, total |
| `use-checkout.test.ts` | Submit flow, error handling |
| `use-order-tracking.test.ts` | Polling, status updates |
| `api-adapter.test.ts` | HTTP calls |

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- Polling para tracking — considerar WebSocket/SSE para tiempo real
- localStorage para carrito — puede perder datos si se limpia
- Carrito por restaurante (key = restaurantId) — no cross-restaurant
