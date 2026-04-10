# TDD Workflow — Yantar

## Herramientas

| Componente | Framework de Testing |
|------------|---------------------|
| Backend (NestJS) | Jest |
| Frontend (Next.js) | Jest + React Testing Library |
| E2E (si aplica) | Supertest (API) |

## Donde aplicar TDD estricto

### Obligatorio (Red → Green → Refactor)
- `domain/entities/` — logica de negocio en entidades
- `domain/services/` — servicios de dominio (funciones puras)
- `domain/value-objects/` — validaciones y reglas
- `application/services/` — use cases

### Tests pero no TDD estricto
- `infrastructure/controllers/` — tests de integracion e2e
- Frontend: tests de componentes clave
- WebSocket gateways

## Ciclo TDD

### 1. Escribir el test (RED)

```typescript
// src/order/domain/entities/order.entity.spec.ts
describe('Order', () => {
  it('should transition from PENDING to CONFIRMED', () => {
    const order = OrderFactory.createPending()
    
    order.confirm()
    
    expect(order.status).toBe(OrderStatus.CONFIRMED)
  })
  
  it('should throw when confirming a cancelled order', () => {
    const order = OrderFactory.createCancelled()
    
    expect(() => order.confirm()).toThrow(InvalidOrderTransitionError)
  })
})
```

### 2. Verificar que FALLA

```bash
pnpm --filter backend test -- --testPathPattern=order.entity
```

El test debe fallar porque el codigo aun no existe.

### 3. Implementar (GREEN)

Implementar capa por capa, de dentro hacia fuera:

1. **Domain** — entidades, value objects, ports (interfaces)
2. **Application** — services (use cases), DTOs
3. **Infrastructure** — controllers, repositories, adapters

```typescript
// src/order/domain/entities/order.entity.ts
export class Order {
  confirm(): void {
    if (this.status === OrderStatus.CANCELLED) {
      throw new InvalidOrderTransitionError('Cannot confirm cancelled order')
    }
    this.status = OrderStatus.CONFIRMED
  }
}
```

### 4. Verificar que PASA

```bash
pnpm --filter backend test -- --testPathPattern=order.entity
```

### 5. Refactorizar

- Extraer value objects si hay logica repetida
- Renombrar para mayor claridad
- Verificar que los tests siguen pasando

### 6. Tests de Fitness Arquitectonica

```bash
pnpm --filter backend test -- --testPathPattern=architecture
```

Verifica:
- domain/ y application/ no importan frameworks
- Cross-domain solo via ports
- Toda query filtra por companyId

## Estructura de Tests

```
apps/backend/
  src/
    order/
      domain/
        entities/
          order.entity.ts
          order.entity.spec.ts        ← Co-located test
      application/
        services/
          create-order.service.ts
          create-order.service.spec.ts ← Co-located test
  test/
    order/
      order.e2e.spec.ts              ← E2E tests
    architecture.spec.ts              ← Fitness tests
    factories/                        ← Test factories
```

## Convencion de Tests

- **Nombre**: `{file}.spec.ts` co-located con el archivo fuente
- **E2E**: en carpeta `test/` raiz del backend
- **Factories**: `test/factories/` — para crear entidades de prueba
- **Mocks**: definir en el propio test, no en archivos separados (a menos que se reutilicen en 3+ tests)

## Test de Use Case (Application Layer)

```typescript
// src/order/application/services/create-order.service.spec.ts
describe('CreateOrderService', () => {
  let service: CreateOrderService
  let mockOrderRepo: jest.Mocked<IOrderRepository>
  let mockNotificationService: jest.Mocked<INotificationService>

  beforeEach(() => {
    mockOrderRepo = {
      save: jest.fn(),
      getById: jest.fn(),
    }
    mockNotificationService = {
      notifyNewOrder: jest.fn(),
    }
    service = new CreateOrderService(mockOrderRepo, mockNotificationService)
  })

  it('should create order and notify restaurant', async () => {
    const request: CreateOrderRequest = {
      companyId: 'company-1',
      branchId: 'branch-1',
      customerId: 'customer-1',
      items: [{ dishId: 'dish-1', quantity: 2 }],
      deliveryMode: DeliveryMode.DELIVERY,
    }
    mockOrderRepo.save.mockResolvedValue(OrderFactory.createPending())

    const result = await service.execute(request)

    expect(mockOrderRepo.save).toHaveBeenCalledTimes(1)
    expect(mockNotificationService.notifyNewOrder).toHaveBeenCalledTimes(1)
    expect(result.status).toBe(OrderStatus.PENDING)
  })
})
```

## Test E2E (Controller)

```typescript
// test/order/order.e2e.spec.ts
describe('OrderController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = module.createNestApplication()
    await app.init()
  })

  it('POST /orders should create order', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${testToken}`)
      .send({ branchId: 'branch-1', items: [...] })
      .expect(201)
      .expect(res => {
        expect(res.body.status).toBe('PENDING')
      })
  })
})
```
