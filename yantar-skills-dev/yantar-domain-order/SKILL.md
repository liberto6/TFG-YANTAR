---
name: yantar-domain-order
description: >
  Documentacion viva del bounded context Order: carrito de compra,
  pedidos, lifecycle de estados, modalidades de entrega, tiempo real y notificaciones.
---

# Order Domain

## Proposito

Gestiona el ciclo de vida completo de pedidos: desde la creacion del carrito hasta la entrega/recogida. Soporta pickup y delivery a domicilio. Notifica al restaurante en tiempo real via WebSocket. El restaurante puede aceptar o rechazar pedidos.

## Mapa de Archivos

```
apps/backend/src/order/
├── domain/
│   ├── entities/
│   │   ├── order.entity.ts          # Order con state machine
│   │   └── order-item.entity.ts     # OrderItem
│   ├── ports/
│   │   ├── order-repository.port.ts
│   │   ├── notification-service.port.ts  # Notificaciones tiempo real
│   │   ├── loyalty-checker.port.ts       # Cross-domain → Loyalty
│   │   └── payment-gateway.port.ts       # Mocked por ahora
│   ├── value-objects/
│   │   ├── order-status.enum.ts          # State machine
│   │   ├── delivery-mode.enum.ts         # PICKUP, DELIVERY
│   │   └── order-item-customization.vo.ts
│   ├── services/
│   │   └── pricing.service.ts        # Calculos de total, descuentos
│   └── errors/
│       ├── order-not-found.error.ts
│       ├── empty-cart.error.ts
│       └── invalid-order-transition.error.ts
├── application/
│   ├── services/
│   │   ├── create-order.service.ts          # Crear pedido desde carrito
│   │   ├── accept-order.service.ts          # Restaurante acepta
│   │   ├── reject-order.service.ts          # Restaurante rechaza
│   │   ├── update-order-status.service.ts   # Mover entre estados
│   │   ├── cancel-order.service.ts          # Cliente cancela
│   │   ├── get-order.service.ts
│   │   ├── get-order-history.service.ts
│   │   └── get-active-orders.service.ts     # Para vista operativa
│   └── dtos/
│       ├── create-order.dto.ts
│       ├── order.dto.ts
│       └── order-status.dto.ts
├── infrastructure/
│   ├── controllers/
│   │   ├── order.controller.ts          # /orders routes (customer)
│   │   └── admin-order.controller.ts    # /admin/orders routes (operativo)
│   ├── repositories/
│   │   └── prisma-order.repository.ts
│   ├── gateways/
│   │   └── order-events.gateway.ts      # WebSocket gateway para tiempo real
│   └── adapters/
│       ├── ws-notification.adapter.ts   # INotificationService → WebSocket
│       └── mock-payment.adapter.ts      # IPaymentGateway → mock
└── order.module.ts
```

## Entidades

### Order
- **Campos**: `id`, `companyId`, `branchId`, `customerId`, `status`, `deliveryMode`, `items[]`, `subtotal`, `deliveryFee`, `discount`, `total`, `notes`, `deliveryAddress` (si DELIVERY), `scheduledTime` (franja horaria elegida), `rejectionReason`, `estimatedTimeMinutes`, `createdAt`, `confirmedAt`, `completedAt`
- **State Machine**:
  ```
  PENDING → ACCEPTED → PREPARING → READY → DELIVERED
  PENDING → REJECTED
  PENDING → CANCELLED (por cliente)
  ACCEPTED → CANCELLED (por cliente, con condiciones)
  ```
- **Logica**:
  - `accept()` → PENDING → ACCEPTED
  - `reject(reason)` → PENDING → REJECTED
  - `startPreparing()` → ACCEPTED → PREPARING
  - `markReady()` → PREPARING → READY
  - `markDelivered()` → READY → DELIVERED
  - `cancel(reason)` → solo desde PENDING o ACCEPTED
  - `isCancellable()` → true si PENDING o ACCEPTED
  - `isActive()` → true si no DELIVERED, REJECTED ni CANCELLED
  - `calculateTotal(items, deliveryFee, discount)` → subtotal + fee - discount

### OrderItem
- **Campos**: `id`, `dishId`, `dishName`, `quantity`, `unitPrice`, `selectedVariant` (nombre + precio), `selectedModifiers[]` (nombre + precio), `notes`, `lineTotal`

## Value Objects

- **OrderStatus**: `PENDING`, `ACCEPTED`, `REJECTED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`
- **DeliveryMode**: `PICKUP`, `DELIVERY`
- **OrderItemCustomization**: `name`, `type` (VARIANT/MODIFIER), `price`

## Ports (Interfaces)

### IOrderRepository
```typescript
getById(orderId: string, companyId: string): Promise<Order | null>
getByCustomer(customerId: string, companyId: string, limit?: number, offset?: number): Promise<Order[]>
getActiveByBranch(branchId: string): Promise<Order[]>  // Para vista operativa
save(order: Order): Promise<Order>
updateStatus(orderId: string, status: OrderStatus): Promise<Order>
```

### INotificationService
```typescript
notifyNewOrder(order: Order): Promise<void>        // WebSocket → vista operativa
notifyOrderStatusChange(order: Order): Promise<void> // WebSocket → customer
```

### ILoyaltyChecker (cross-domain → Loyalty)
```typescript
getAvailablePoints(customerId: string, companyId: string): Promise<number>
redeemPoints(customerId: string, companyId: string, points: number): Promise<void>
awardPoints(customerId: string, companyId: string, orderTotal: number): Promise<number>
```

### IPaymentGateway (mocked)
```typescript
createPaymentIntent(orderId: string, amount: number): Promise<PaymentIntent>
confirmPayment(paymentId: string): Promise<boolean>
```

## WebSocket Events

### Desde el servidor
- `order:created` → vista operativa recibe pedido nuevo
- `order:updated` → customer recibe cambio de estado
- `order:cancelled` → ambas partes

### Desde el cliente
- `order:subscribe` → customer se suscribe a actualizaciones de su pedido
- `branch:subscribe` → vista operativa se suscribe a pedidos de su sede

## Dependencias Cross-Domain

| Direccion | Port | Dominio Proveedor |
|-----------|------|--------------------|
| Consume | ILoyaltyChecker | Loyalty (verificar/canjear puntos) |
| Consume | Menu (validar platos) | Menu (precios, disponibilidad) |
| Provee | Pedidos completados | Loyalty (para otorgar puntos) |

## Notas

- El pago esta MOCKED — interfaz preparada para integracion futura
- scheduledTime: franja horaria elegida por el cliente (ej: 14:00-14:30)
- estimatedTimeMinutes: estimacion del restaurante
- El flujo de pago en efectivo no requiere PaymentGateway
- Considerar eventos de dominio para desacoplar notificaciones
