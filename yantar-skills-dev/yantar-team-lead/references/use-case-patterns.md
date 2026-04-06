# Use Case Patterns — Yantar

## Backend (NestJS Services)

### Convencion de Nombres

| Patron | Ejemplo |
|--------|---------|
| Servicio | `CreateOrderService`, `GetMenuService` |
| DTO Request | `CreateOrderRequest` |
| DTO Response | `CreateOrderResponse` |
| Archivo | `create-order.service.ts` |
| Test | `create-order.service.spec.ts` |

### Estructura de un Use Case

Un archivo, una clase, un metodo `execute()`:

```typescript
// src/order/application/services/create-order.service.ts
import { Injectable, Inject } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { INotificationService } from '../../domain/ports/notification-service.port'
import { Order } from '../../domain/entities/order.entity'
import { CreateOrderRequest, CreateOrderResponse } from '../dtos/create-order.dto'

@Injectable()
export class CreateOrderService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
    @Inject('INotificationService')
    private readonly notifications: INotificationService,
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    // 1. Crear entidad de dominio
    const order = Order.create({
      companyId: request.companyId,
      branchId: request.branchId,
      customerId: request.customerId,
      items: request.items,
      deliveryMode: request.deliveryMode,
    })

    // 2. Persistir
    const saved = await this.orderRepo.save(order)

    // 3. Side effects
    await this.notifications.notifyNewOrder(saved)

    // 4. Retornar DTO
    return CreateOrderResponse.fromEntity(saved)
  }
}
```

### Reglas

1. **Constructor recibe ports (interfaces)**, nunca implementaciones concretas
2. **DTOs separados** — nunca reusar entidades como DTOs
3. **Errores de dominio** — lanzar DomainError, nunca HttpException
4. **Un servicio = un caso de uso** — no meter multiples operaciones en un servicio
5. **@Injectable()** es la unica anotacion de NestJS permitida en application/

### DTOs con class-validator

```typescript
// src/order/application/dtos/create-order.dto.ts
import { IsString, IsArray, IsEnum, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateOrderRequest {
  @IsString()
  companyId: string

  @IsString()
  branchId: string

  @IsString()
  customerId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequest)
  items: OrderItemRequest[]

  @IsEnum(DeliveryMode)
  deliveryMode: DeliveryMode
}

export class CreateOrderResponse {
  id: string
  status: OrderStatus
  total: number
  createdAt: Date

  static fromEntity(order: Order): CreateOrderResponse {
    return {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
    }
  }
}
```

### Cuando Use Case vs Domain Service

| Situacion | Donde va |
|-----------|----------|
| Orquestar multiples ports | **Use Case (Application Service)** |
| Calcular precio total con descuentos | **Domain Service** o metodo de entidad |
| Logica que no depende de estado externo | **Domain Service** |
| Logica que necesita I/O (BD, API) | **Use Case** (orquesta ports) |
| Regla que pertenece a una sola entidad | **Metodo de entidad** |

### Manejo de Errores

```typescript
// En el use case — lanzar errores de dominio
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error'

async execute(request) {
  const order = await this.orderRepo.getById(request.orderId)
  if (!order) {
    throw new OrderNotFoundError(request.orderId)
  }
}

// En el controller — el DomainExceptionFilter traduce automaticamente
// No hace falta try/catch manual en cada controller
```

---

## Controller (Infrastructure)

El controller solo traduce HTTP <-> DTOs y delega al servicio:

```typescript
// src/order/infrastructure/controllers/order.controller.ts
@Controller('orders')
export class OrderController {
  constructor(private readonly createOrder: CreateOrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() request: CreateOrderRequest,
    @CurrentUser() user: AuthUser,
  ): Promise<CreateOrderResponse> {
    return this.createOrder.execute({
      ...request,
      customerId: user.id,
    })
  }
}
```

**El controller NO contiene logica de negocio.**

---

## Frontend Hooks (Feature Layer)

Cada operacion tiene su propio hook con React Query:

```typescript
// src/features/orders/hooks/use-create-order.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateOrderRequest) =>
      apiClient.post<CreateOrderResponse>('/orders', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// Para queries
export function useOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId, 'status'],
    queryFn: () => apiClient.get<OrderStatusResponse>(`/orders/${orderId}/status`),
    refetchInterval: 10_000, // Poll cada 10s como fallback del WebSocket
  })
}
```
