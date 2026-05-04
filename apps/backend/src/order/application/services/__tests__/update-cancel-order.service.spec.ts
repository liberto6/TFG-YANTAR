import { DeliveryMode, OrderStatus } from '@yantar/shared'
import { UpdateOrderStatusService } from '../update-order-status.service'
import { CancelOrderService } from '../cancel-order.service'
import { Order } from '../../../domain/entities/order.entity'
import { OrderItem } from '../../../domain/entities/order-item.entity'
import { OrderNotFoundError } from '../../../domain/errors/order-not-found.error'
import { InvalidOrderTransitionError } from '../../../domain/errors/invalid-order-transition.error'

const mockOrderRepository = { getById: jest.fn(), getByCustomer: jest.fn(), getActiveByBranch: jest.fn(), getByBranchAndDate: jest.fn(), save: jest.fn() }
const mockNotificationService = { notifyNewOrder: jest.fn(), notifyOrderStatusChange: jest.fn() }

const item = new OrderItem({ id: 'i-1', orderId: 'o-1', dishId: 'd-1', dishName: 'Pizza', quantity: 1, unitPrice: 10, selectedVariant: null, selectedModifiers: [], notes: null })
const baseProps = { id: 'o-1', companyId: 'co-1', branchId: 'b-1', customerId: 'u-1', deliveryMode: DeliveryMode.PICKUP, items: [item], subtotal: 10, deliveryFee: 0, discount: 0, total: 10 }

describe('UpdateOrderStatusService', () => {
  let service: UpdateOrderStatusService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UpdateOrderStatusService(mockOrderRepository, mockNotificationService, null)
  })

  it('startPreparing: ACCEPTED → PREPARING', async () => {
    const order = Order.create(baseProps).accept(20)
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'o-1', 'startPreparing')
    expect(result.status).toBe(OrderStatus.PREPARING)
  })

  it('markReady: PREPARING → READY', async () => {
    const order = Order.create(baseProps).accept(20).startPreparing()
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'o-1', 'markReady')
    expect(result.status).toBe(OrderStatus.READY)
  })

  it('markDelivered: READY → DELIVERED', async () => {
    const order = Order.create(baseProps).accept(20).startPreparing().markReady()
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'o-1', 'markDelivered')
    expect(result.status).toBe(OrderStatus.DELIVERED)
  })

  it('should throw when invalid transition', async () => {
    const order = Order.create(baseProps) // PENDING
    mockOrderRepository.getById.mockResolvedValue(order)

    await expect(service.execute('co-1', 'o-1', 'startPreparing')).rejects.toThrow(
      InvalidOrderTransitionError,
    )
  })

  it('should throw OrderNotFoundError', async () => {
    mockOrderRepository.getById.mockResolvedValue(null)
    await expect(service.execute('co-1', 'bad-id', 'markReady')).rejects.toThrow(OrderNotFoundError)
  })
})

describe('UpdateOrderStatusService — acumulación automática de puntos', () => {
  const mockLoyaltyChecker = {
    getAvailablePoints: jest.fn(),
    redeemPoints: jest.fn(),
    awardPoints: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('al marcar como DELIVERED, llama a awardPoints con customerId, companyId, total y orderId', async () => {
    const service = new UpdateOrderStatusService(
      mockOrderRepository,
      mockNotificationService,
      mockLoyaltyChecker,
    )
    const order = Order.create(baseProps).accept(20).startPreparing().markReady()
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)
    mockLoyaltyChecker.awardPoints.mockResolvedValue(10)

    await service.execute('co-1', 'o-1', 'markDelivered')

    expect(mockLoyaltyChecker.awardPoints).toHaveBeenCalledWith(
      'u-1',  // customerId
      'co-1', // companyId
      10,     // total
      'o-1',  // orderId
    )
  })

  it('NO llama a awardPoints en transiciones distintas de markDelivered', async () => {
    const service = new UpdateOrderStatusService(
      mockOrderRepository,
      mockNotificationService,
      mockLoyaltyChecker,
    )
    const order = Order.create(baseProps).accept(20)
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    await service.execute('co-1', 'o-1', 'startPreparing')

    expect(mockLoyaltyChecker.awardPoints).not.toHaveBeenCalled()
  })

  it('completa el cambio de estado aunque awardPoints lance una excepción', async () => {
    const service = new UpdateOrderStatusService(
      mockOrderRepository,
      mockNotificationService,
      mockLoyaltyChecker,
    )
    const order = Order.create(baseProps).accept(20).startPreparing().markReady()
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)
    mockLoyaltyChecker.awardPoints.mockRejectedValue(new Error('loyalty system down'))

    const result = await service.execute('co-1', 'o-1', 'markDelivered')

    expect(result.status).toBe(OrderStatus.DELIVERED)
    expect(mockLoyaltyChecker.awardPoints).toHaveBeenCalled()
  })

  it('completa el cambio de estado a DELIVERED sin loyaltyChecker (null)', async () => {
    const service = new UpdateOrderStatusService(
      mockOrderRepository,
      mockNotificationService,
      null,
    )
    const order = Order.create(baseProps).accept(20).startPreparing().markReady()
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'o-1', 'markDelivered')

    expect(result.status).toBe(OrderStatus.DELIVERED)
    expect(mockLoyaltyChecker.awardPoints).not.toHaveBeenCalled()
  })
})

describe('CancelOrderService', () => {
  let service: CancelOrderService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CancelOrderService(mockOrderRepository, mockNotificationService)
  })

  it('should cancel a PENDING order', async () => {
    const order = Order.create(baseProps)
    mockOrderRepository.getById.mockResolvedValue(order)
    mockOrderRepository.save.mockImplementation(async (o: Order) => o)

    const result = await service.execute('co-1', 'o-1', 'u-1', 'cambié de opinión')
    expect(result.status).toBe(OrderStatus.CANCELLED)
  })

  it('should throw when order not cancellable', async () => {
    const order = Order.create(baseProps).accept(20).startPreparing()
    mockOrderRepository.getById.mockResolvedValue(order)

    await expect(service.execute('co-1', 'o-1', 'u-1')).rejects.toThrow(
      InvalidOrderTransitionError,
    )
  })
})
