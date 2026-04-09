import { DeliveryMode, OrderStatus } from '@yantar/shared'
import { GetDashboardStatsService } from '../get-dashboard-stats.service'
import { Order } from '../../../domain/entities/order.entity'
import { OrderItem } from '../../../domain/entities/order-item.entity'

// ── helpers ───────────────────────────────────────────────────────────────

const item = new OrderItem({
  id: 'i-1', orderId: 'o-1', dishId: 'd-1', dishName: 'Pizza',
  quantity: 1, unitPrice: 12, selectedVariant: null, selectedModifiers: [], notes: null,
})

function makeOrder(
  id: string,
  status: OrderStatus,
  total: number,
  createdAt = new Date(),
): Order {
  const o = Order.create({
    id,
    companyId: 'co-1',
    branchId: 'b-1',
    customerId: 'u-1',
    deliveryMode: DeliveryMode.PICKUP,
    items: [item],
    subtotal: total,
    deliveryFee: 0,
    discount: 0,
    total,
  })
  ;(o as any).status = status
  ;(o as any).createdAt = createdAt
  return o
}

const mockOrderRepo = {
  getById: jest.fn(),
  getByCustomer: jest.fn(),
  getActiveByBranch: jest.fn(),
  getByBranchAndDate: jest.fn(),
  save: jest.fn(),
}

// ── tests ─────────────────────────────────────────────────────────────────

describe('GetDashboardStatsService', () => {
  let service: GetDashboardStatsService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetDashboardStatsService(mockOrderRepo as any)
  })

  it('returns zeroed stats when there are no orders for the day', async () => {
    mockOrderRepo.getByBranchAndDate.mockResolvedValue([])

    const result = await service.execute('b-1', new Date())

    expect(result.ordersTotal).toBe(0)
    expect(result.revenue).toBe(0)
    expect(result.deliveredCount).toBe(0)
    expect(result.cancelledCount).toBe(0)
    expect(result.activeCount).toBe(0)
  })

  it('counts only delivered orders for revenue and deliveredCount', async () => {
    mockOrderRepo.getByBranchAndDate.mockResolvedValue([
      makeOrder('o-1', OrderStatus.DELIVERED, 20),
      makeOrder('o-2', OrderStatus.DELIVERED, 30),
      makeOrder('o-3', OrderStatus.PENDING, 15),
    ])

    const result = await service.execute('b-1', new Date())

    expect(result.deliveredCount).toBe(2)
    expect(result.revenue).toBe(50)
    expect(result.ordersTotal).toBe(3)
  })

  it('computes avgTicket as revenue divided by deliveredCount', async () => {
    mockOrderRepo.getByBranchAndDate.mockResolvedValue([
      makeOrder('o-1', OrderStatus.DELIVERED, 30),
      makeOrder('o-2', OrderStatus.DELIVERED, 10),
    ])

    const result = await service.execute('b-1', new Date())

    expect(result.avgTicket).toBe(20)
  })

  it('returns avgTicket of 0 when no delivered orders', async () => {
    mockOrderRepo.getByBranchAndDate.mockResolvedValue([
      makeOrder('o-1', OrderStatus.CANCELLED, 15),
    ])

    const result = await service.execute('b-1', new Date())

    expect(result.avgTicket).toBe(0)
  })

  it('counts active orders (PENDING | ACCEPTED | PREPARING | READY)', async () => {
    mockOrderRepo.getByBranchAndDate.mockResolvedValue([
      makeOrder('o-1', OrderStatus.PENDING, 10),
      makeOrder('o-2', OrderStatus.ACCEPTED, 10),
      makeOrder('o-3', OrderStatus.PREPARING, 10),
      makeOrder('o-4', OrderStatus.READY, 10),
      makeOrder('o-5', OrderStatus.DELIVERED, 10),
    ])

    const result = await service.execute('b-1', new Date())

    expect(result.activeCount).toBe(4)
  })

  it('counts cancelled orders', async () => {
    mockOrderRepo.getByBranchAndDate.mockResolvedValue([
      makeOrder('o-1', OrderStatus.CANCELLED, 10),
      makeOrder('o-2', OrderStatus.REJECTED, 10),
      makeOrder('o-3', OrderStatus.DELIVERED, 20),
    ])

    const result = await service.execute('b-1', new Date())

    expect(result.cancelledCount).toBe(2)
  })

  it('calls getByBranchAndDate with the given branchId and date', async () => {
    mockOrderRepo.getByBranchAndDate.mockResolvedValue([])
    const date = new Date('2025-01-15')

    await service.execute('b-42', date)

    expect(mockOrderRepo.getByBranchAndDate).toHaveBeenCalledWith('b-42', date)
  })
})
