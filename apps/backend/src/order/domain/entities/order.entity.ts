import { OrderStatus, DeliveryMode } from '@yantar/shared'
import { OrderItem } from './order-item.entity'
import { InvalidOrderTransitionError } from '../errors/invalid-order-transition.error'

export class Order {
  readonly id: string
  readonly companyId: string
  readonly branchId: string
  readonly customerId: string
  readonly status: OrderStatus
  readonly deliveryMode: DeliveryMode
  readonly items: OrderItem[]
  readonly subtotal: number
  readonly deliveryFee: number
  readonly discount: number
  readonly total: number
  readonly notes: string | null
  readonly deliveryAddress: string | null
  readonly scheduledTime: Date | null
  readonly rejectionReason: string | null
  readonly estimatedMinutes: number | null
  readonly paymentMethod: string | null
  readonly createdAt: Date
  readonly confirmedAt: Date | null
  readonly completedAt: Date | null
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    companyId: string
    branchId: string
    customerId: string
    status: OrderStatus
    deliveryMode: DeliveryMode
    items: OrderItem[]
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
    notes: string | null
    deliveryAddress: string | null
    scheduledTime: Date | null
    rejectionReason: string | null
    estimatedMinutes: number | null
    paymentMethod: string | null
    createdAt: Date
    confirmedAt: Date | null
    completedAt: Date | null
    updatedAt: Date
  }) {
    this.id = props.id
    this.companyId = props.companyId
    this.branchId = props.branchId
    this.customerId = props.customerId
    this.status = props.status
    this.deliveryMode = props.deliveryMode
    this.items = props.items
    this.subtotal = props.subtotal
    this.deliveryFee = props.deliveryFee
    this.discount = props.discount
    this.total = props.total
    this.notes = props.notes
    this.deliveryAddress = props.deliveryAddress
    this.scheduledTime = props.scheduledTime
    this.rejectionReason = props.rejectionReason
    this.estimatedMinutes = props.estimatedMinutes
    this.paymentMethod = props.paymentMethod
    this.createdAt = props.createdAt
    this.confirmedAt = props.confirmedAt
    this.completedAt = props.completedAt
    this.updatedAt = props.updatedAt
  }

  // ─── Factory ──────────────────────────────────────────────────────────────

  static create(props: {
    id: string
    companyId: string
    branchId: string
    customerId: string
    deliveryMode: DeliveryMode
    items: OrderItem[]
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
    notes?: string | null
    deliveryAddress?: string | null
    scheduledTime?: Date | null
    paymentMethod?: string | null
  }): Order {
    const now = new Date()
    return new Order({
      id: props.id,
      companyId: props.companyId,
      branchId: props.branchId,
      customerId: props.customerId,
      status: OrderStatus.PENDING,
      deliveryMode: props.deliveryMode,
      items: props.items,
      subtotal: props.subtotal,
      deliveryFee: props.deliveryFee,
      discount: props.discount,
      total: props.total,
      notes: props.notes ?? null,
      deliveryAddress: props.deliveryAddress ?? null,
      scheduledTime: props.scheduledTime ?? null,
      rejectionReason: null,
      estimatedMinutes: null,
      paymentMethod: props.paymentMethod ?? null,
      createdAt: now,
      confirmedAt: null,
      completedAt: null,
      updatedAt: now,
    })
  }

  static restore(props: {
    id: string
    companyId: string
    branchId: string
    customerId: string
    status: OrderStatus
    deliveryMode: DeliveryMode
    items: OrderItem[]
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
    notes: string | null
    deliveryAddress: string | null
    scheduledTime: Date | null
    rejectionReason: string | null
    estimatedMinutes: number | null
    paymentMethod: string | null
    createdAt: Date
    confirmedAt: Date | null
    completedAt: Date | null
    updatedAt: Date
  }): Order {
    return new Order(props)
  }

  // ─── State Machine ────────────────────────────────────────────────────────

  accept(estimatedMinutes: number): Order {
    if (this.status !== OrderStatus.PENDING) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.ACCEPTED)
    }
    const now = new Date()
    return new Order({
      ...this.toProps(),
      status: OrderStatus.ACCEPTED,
      estimatedMinutes,
      confirmedAt: now,
      updatedAt: now,
    })
  }

  reject(reason: string): Order {
    if (this.status !== OrderStatus.PENDING) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.REJECTED)
    }
    const now = new Date()
    return new Order({
      ...this.toProps(),
      status: OrderStatus.REJECTED,
      rejectionReason: reason,
      updatedAt: now,
    })
  }

  startPreparing(): Order {
    if (this.status !== OrderStatus.ACCEPTED) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.PREPARING)
    }
    return new Order({
      ...this.toProps(),
      status: OrderStatus.PREPARING,
      updatedAt: new Date(),
    })
  }

  markReady(): Order {
    if (this.status !== OrderStatus.PREPARING) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.READY)
    }
    return new Order({
      ...this.toProps(),
      status: OrderStatus.READY,
      updatedAt: new Date(),
    })
  }

  markDelivered(): Order {
    if (this.status !== OrderStatus.READY) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.DELIVERED)
    }
    const now = new Date()
    return new Order({
      ...this.toProps(),
      status: OrderStatus.DELIVERED,
      completedAt: now,
      updatedAt: now,
    })
  }

  cancel(reason?: string): Order {
    if (!this.isCancellable()) {
      throw new InvalidOrderTransitionError(this.status, OrderStatus.CANCELLED)
    }
    return new Order({
      ...this.toProps(),
      status: OrderStatus.CANCELLED,
      rejectionReason: reason ?? null,
      updatedAt: new Date(),
    })
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  isCancellable(): boolean {
    return (
      this.status === OrderStatus.PENDING || this.status === OrderStatus.ACCEPTED
    )
  }

  isActive(): boolean {
    return (
      this.status !== OrderStatus.DELIVERED &&
      this.status !== OrderStatus.REJECTED &&
      this.status !== OrderStatus.CANCELLED
    )
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private toProps() {
    return {
      id: this.id,
      companyId: this.companyId,
      branchId: this.branchId,
      customerId: this.customerId,
      status: this.status,
      deliveryMode: this.deliveryMode,
      items: this.items,
      subtotal: this.subtotal,
      deliveryFee: this.deliveryFee,
      discount: this.discount,
      total: this.total,
      notes: this.notes,
      deliveryAddress: this.deliveryAddress,
      scheduledTime: this.scheduledTime,
      rejectionReason: this.rejectionReason,
      estimatedMinutes: this.estimatedMinutes,
      paymentMethod: this.paymentMethod,
      createdAt: this.createdAt,
      confirmedAt: this.confirmedAt,
      completedAt: this.completedAt,
      updatedAt: this.updatedAt,
    }
  }
}
