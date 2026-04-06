import { DeliveryMode, OrderStatus } from '@yantar/shared'
import { AcceptOrderService } from '../accept-order.service'
import { RejectOrderService } from '../reject-order.service'
import { Order } from '../../../domain/entities/order.entity'
import { OrderItem } from '../../../domain/entities/order-item.entity'
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error'

const mockOrderRepository = { getById: jest.fn(), getByCustomer: jest.fn(), getActiveByBranch: jest.fn(), save: jest.fn() }
const mockNotificationService = { notifyNewOrder: jest.fn(), notifyOrderStatusChange: jest.fn() }

const pendingOrder = Order.create({
  id: 'order-1',
  companyId: 'co-1',
  branchId: 'branch-1',
  customerId: 'user-1',
  deliveryMode: DeliveryMode.PICKUP,
  items: [new OrderItem({ id: 'i-1', orderId: 'order-1', dishId: 'd-1', dishName: 'Pizza', quantity: 1, unitPrice: 10, selectedVariant: null, selectedModifiers: [], notes: null })],
  subtotal: 10,
  deliveryFee: 0,
  discount: 0,
  total: 10,
})

describe('AcceptOrderService', () => {
  let service: AcceptOrderService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new AcceptOrderService(mockOrderRepository, mockNotificationService)
  })

  it('should accept a PENDING order', async () => {
    mockOrderRepository.getById.mockResolvedValue(pendingOrder)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'order-1', 20)

    expect(result.status).toBe(OrderStatus.ACCEPTED)
    expect(result.estimatedMinutes).toBe(20)
    expect(mockNotificationService.notifyOrderStatusChange).toHaveBeenCalledTimes(1)
  })

  it('should throw OrderNotFoundError when not found', async () => {
    mockOrderRepository.getById.mockResolvedValue(null)
    await expect(service.execute('co-1', 'bad-id', 20)).rejects.toThrow(OrderNotFoundError)
  })
})

describe('RejectOrderService', () => {
  let service: RejectOrderService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new RejectOrderService(mockOrderRepository, mockNotificationService)
  })

  it('should reject a PENDING order', async () => {
    mockOrderRepository.getById.mockResolvedValue(pendingOrder)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'order-1', 'Cocina cerrada')

    expect(result.status).toBe(OrderStatus.REJECTED)
    expect(result.rejectionReason).toBe('Cocina cerrada')
  })

  it('should throw OrderNotFoundError when not found', async () => {
    mockOrderRepository.getById.mockResolvedValue(null)
    await expect(service.execute('co-1', 'bad-id', 'motivo')).rejects.toThrow(OrderNotFoundError)
  })
})
