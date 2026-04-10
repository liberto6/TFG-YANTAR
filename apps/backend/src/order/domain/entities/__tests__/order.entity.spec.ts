import { OrderStatus, DeliveryMode } from '@yantar/shared'
import { Order } from '../order.entity'
import { OrderItem } from '../order-item.entity'
import { InvalidOrderTransitionError } from '../../errors/invalid-order-transition.error'

const makeItem = (orderId = 'order-1') =>
  new OrderItem({
    id: 'item-1',
    orderId,
    dishId: 'dish-1',
    dishName: 'Pizza',
    quantity: 2,
    unitPrice: 10.0,
    selectedVariant: null,
    selectedModifiers: [],
    notes: null,
  })

const makeOrder = (overrides: Partial<Parameters<typeof Order.create>[0]> = {}) =>
  Order.create({
    id: 'order-1',
    companyId: 'co-1',
    branchId: 'branch-1',
    customerId: 'user-1',
    deliveryMode: DeliveryMode.PICKUP,
    items: [makeItem()],
    subtotal: 20.0,
    deliveryFee: 0,
    discount: 0,
    total: 20.0,
    ...overrides,
  })

describe('Order entity', () => {
  describe('create', () => {
    it('should start in PENDING status', () => {
      const order = makeOrder()
      expect(order.status).toBe(OrderStatus.PENDING)
      expect(order.confirmedAt).toBeNull()
      expect(order.completedAt).toBeNull()
    })

    it('should compute lineTotal on OrderItem', () => {
      const item = makeItem()
      expect(item.lineTotal).toBe(20.0)
    })
  })

  describe('accept', () => {
    it('should transition PENDING → ACCEPTED', () => {
      const order = makeOrder()
      const accepted = order.accept(30)

      expect(accepted.status).toBe(OrderStatus.ACCEPTED)
      expect(accepted.estimatedMinutes).toBe(30)
      expect(accepted.confirmedAt).not.toBeNull()
    })

    it('should throw when not PENDING', () => {
      const order = makeOrder()
      const accepted = order.accept(20)
      expect(() => accepted.accept(10)).toThrow(InvalidOrderTransitionError)
    })
  })

  describe('reject', () => {
    it('should transition PENDING → REJECTED', () => {
      const order = makeOrder()
      const rejected = order.reject('Sin stock')

      expect(rejected.status).toBe(OrderStatus.REJECTED)
      expect(rejected.rejectionReason).toBe('Sin stock')
    })

    it('should throw when not PENDING', () => {
      const order = makeOrder()
      const accepted = order.accept(20)
      expect(() => accepted.reject('tarde')).toThrow(InvalidOrderTransitionError)
    })
  })

  describe('full happy path', () => {
    it('PENDING → ACCEPTED → PREPARING → READY → DELIVERED', () => {
      const order = makeOrder()
      const accepted = order.accept(25)
      const preparing = accepted.startPreparing()
      const ready = preparing.markReady()
      const delivered = ready.markDelivered()

      expect(delivered.status).toBe(OrderStatus.DELIVERED)
      expect(delivered.completedAt).not.toBeNull()
      expect(delivered.isActive()).toBe(false)
    })
  })

  describe('cancel', () => {
    it('should cancel a PENDING order', () => {
      const order = makeOrder()
      const cancelled = order.cancel('Me arrepentí')

      expect(cancelled.status).toBe(OrderStatus.CANCELLED)
      expect(cancelled.rejectionReason).toBe('Me arrepentí')
    })

    it('should cancel an ACCEPTED order', () => {
      const order = makeOrder().accept(20)
      const cancelled = order.cancel()

      expect(cancelled.status).toBe(OrderStatus.CANCELLED)
    })

    it('should throw when trying to cancel a PREPARING order', () => {
      const order = makeOrder().accept(20).startPreparing()
      expect(() => order.cancel()).toThrow(InvalidOrderTransitionError)
    })
  })

  describe('isCancellable / isActive', () => {
    it('PENDING is cancellable and active', () => {
      const order = makeOrder()
      expect(order.isCancellable()).toBe(true)
      expect(order.isActive()).toBe(true)
    })

    it('DELIVERED is not active', () => {
      const order = makeOrder().accept(10).startPreparing().markReady().markDelivered()
      expect(order.isActive()).toBe(false)
      expect(order.isCancellable()).toBe(false)
    })

    it('REJECTED is not active', () => {
      const order = makeOrder().reject('cerrado')
      expect(order.isActive()).toBe(false)
    })
  })
})
