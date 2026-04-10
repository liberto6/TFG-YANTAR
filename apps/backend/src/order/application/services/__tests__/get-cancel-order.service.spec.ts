import { DeliveryMode, OrderStatus } from '@yantar/shared'
import { GetOrderService } from '../get-order.service'
import { GetOrderHistoryService } from '../get-order-history.service'
import { GetActiveOrdersService } from '../get-active-orders.service'
import { CancelOrderService } from '../cancel-order.service'
import { Order } from '../../../domain/entities/order.entity'
import { OrderItem } from '../../../domain/entities/order-item.entity'
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error'

// ── helpers ──────────────────────────────────────────────────────────────────

const item = new OrderItem({
  id: 'i-1', orderId: 'o-1', dishId: 'd-1', dishName: 'Pizza',
  quantity: 2, unitPrice: 10, selectedVariant: null, selectedModifiers: [], notes: null,
})

const makeOrder = (id = 'o-1') =>
  Order.create({
    id,
    companyId: 'co-1',
    branchId: 'b-1',
    customerId: 'u-1',
    deliveryMode: DeliveryMode.PICKUP,
    items: [item],
    subtotal: 20,
    deliveryFee: 0,
    discount: 0,
    total: 20,
  })

const mockOrderRepo = {
  getById: jest.fn(),
  getByCustomer: jest.fn(),
  getActiveByBranch: jest.fn(),
  getByBranchAndDate: jest.fn(),
  save: jest.fn(),
}
const mockNotification = {
  notifyNewOrder: jest.fn(),
  notifyOrderStatusChange: jest.fn(),
}

// ── GetOrderService ───────────────────────────────────────────────────────────

describe('GetOrderService', () => {
  let service: GetOrderService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetOrderService(mockOrderRepo)
  })

  it('should return order DTO when found', async () => {
    mockOrderRepo.getById.mockResolvedValue(makeOrder())

    const result = await service.execute('co-1', 'o-1')

    expect(result.id).toBe('o-1')
    expect(result.total).toBe(20)
    expect(result.status).toBe(OrderStatus.PENDING)
    expect(mockOrderRepo.getById).toHaveBeenCalledWith('o-1', 'co-1')
  })

  it('should throw OrderNotFoundError when not found', async () => {
    mockOrderRepo.getById.mockResolvedValue(null)

    await expect(service.execute('co-1', 'bad-id')).rejects.toThrow(OrderNotFoundError)
  })
})

// ── GetOrderHistoryService ────────────────────────────────────────────────────

describe('GetOrderHistoryService', () => {
  let service: GetOrderHistoryService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetOrderHistoryService(mockOrderRepo)
  })

  it('should return list of orders for a customer', async () => {
    mockOrderRepo.getByCustomer.mockResolvedValue([makeOrder('o-1'), makeOrder('o-2')])

    const result = await service.execute('u-1', 'co-1')

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('o-1')
    expect(result[1].id).toBe('o-2')
    expect(mockOrderRepo.getByCustomer).toHaveBeenCalledWith('u-1', 'co-1', 20, 0)
  })

  it('should return empty array when customer has no orders', async () => {
    mockOrderRepo.getByCustomer.mockResolvedValue([])

    const result = await service.execute('u-1', 'co-1')

    expect(result).toHaveLength(0)
  })

  it('should forward limit and offset to repository', async () => {
    mockOrderRepo.getByCustomer.mockResolvedValue([])

    await service.execute('u-1', 'co-1', 5, 10)

    expect(mockOrderRepo.getByCustomer).toHaveBeenCalledWith('u-1', 'co-1', 5, 10)
  })
})

// ── GetActiveOrdersService ────────────────────────────────────────────────────

describe('GetActiveOrdersService', () => {
  let service: GetActiveOrdersService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetActiveOrdersService(mockOrderRepo)
  })

  it('should return active orders for a branch', async () => {
    const acceptedOrder = makeOrder('o-1').accept(15)
    mockOrderRepo.getActiveByBranch.mockResolvedValue([acceptedOrder])

    const result = await service.execute('b-1')

    expect(result).toHaveLength(1)
    expect(result[0].status).toBe(OrderStatus.ACCEPTED)
    expect(mockOrderRepo.getActiveByBranch).toHaveBeenCalledWith('b-1')
  })

  it('should return empty array when no active orders', async () => {
    mockOrderRepo.getActiveByBranch.mockResolvedValue([])

    const result = await service.execute('b-1')

    expect(result).toHaveLength(0)
  })
})

// ── CancelOrderService ────────────────────────────────────────────────────────

describe('CancelOrderService', () => {
  let service: CancelOrderService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CancelOrderService(mockOrderRepo, mockNotification)
  })

  it('should cancel a PENDING order', async () => {
    const order = makeOrder()
    mockOrderRepo.getById.mockResolvedValue(order)
    mockOrderRepo.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'o-1', 'u-1', 'Cambié de opinión')

    expect(result.status).toBe(OrderStatus.CANCELLED)
    expect(mockNotification.notifyOrderStatusChange).toHaveBeenCalledTimes(1)
  })

  it('should cancel an ACCEPTED order', async () => {
    const order = makeOrder().accept(20)
    mockOrderRepo.getById.mockResolvedValue(order)
    mockOrderRepo.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'o-1', 'u-1')

    expect(result.status).toBe(OrderStatus.CANCELLED)
  })

  it('should throw OrderNotFoundError when order does not exist', async () => {
    mockOrderRepo.getById.mockResolvedValue(null)

    await expect(service.execute('co-1', 'bad-id', 'u-1')).rejects.toThrow(OrderNotFoundError)
  })

  it('should not send notification when order is not found', async () => {
    mockOrderRepo.getById.mockResolvedValue(null)

    await expect(service.execute('co-1', 'bad-id', 'u-1')).rejects.toThrow()
    expect(mockNotification.notifyOrderStatusChange).not.toHaveBeenCalled()
  })
})
