import { OrderStatus, DeliveryMode } from '@yantar/shared'
import { Order } from '../../domain/entities/order.entity'
import { OrderItem, OrderItemModifier } from '../../domain/entities/order-item.entity'

export class OrderItemResponse {
  id!: string
  dishId!: string
  dishName!: string
  quantity!: number
  unitPrice!: number
  selectedVariant!: string | null
  selectedModifiers!: OrderItemModifier[]
  notes!: string | null
  lineTotal!: number

  static fromEntity(item: OrderItem): OrderItemResponse {
    const dto = new OrderItemResponse()
    dto.id = item.id
    dto.dishId = item.dishId
    dto.dishName = item.dishName
    dto.quantity = item.quantity
    dto.unitPrice = item.unitPrice
    dto.selectedVariant = item.selectedVariant
    dto.selectedModifiers = item.selectedModifiers
    dto.notes = item.notes
    dto.lineTotal = item.lineTotal
    return dto
  }
}

export class OrderResponse {
  id!: string
  companyId!: string
  branchId!: string
  customerId!: string
  status!: OrderStatus
  deliveryMode!: DeliveryMode
  items!: OrderItemResponse[]
  subtotal!: number
  deliveryFee!: number
  discount!: number
  total!: number
  notes!: string | null
  deliveryAddress!: string | null
  scheduledTime!: Date | null
  rejectionReason!: string | null
  estimatedMinutes!: number | null
  paymentMethod!: string | null
  createdAt!: Date
  confirmedAt!: Date | null
  completedAt!: Date | null
  updatedAt!: Date

  static fromEntity(order: Order): OrderResponse {
    const dto = new OrderResponse()
    dto.id = order.id
    dto.companyId = order.companyId
    dto.branchId = order.branchId
    dto.customerId = order.customerId
    dto.status = order.status
    dto.deliveryMode = order.deliveryMode
    dto.items = order.items.map(OrderItemResponse.fromEntity)
    dto.subtotal = order.subtotal
    dto.deliveryFee = order.deliveryFee
    dto.discount = order.discount
    dto.total = order.total
    dto.notes = order.notes
    dto.deliveryAddress = order.deliveryAddress
    dto.scheduledTime = order.scheduledTime
    dto.rejectionReason = order.rejectionReason
    dto.estimatedMinutes = order.estimatedMinutes
    dto.paymentMethod = order.paymentMethod
    dto.createdAt = order.createdAt
    dto.confirmedAt = order.confirmedAt
    dto.completedAt = order.completedAt
    dto.updatedAt = order.updatedAt
    return dto
  }
}
