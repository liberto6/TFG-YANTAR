import { Injectable } from '@nestjs/common'
import { OrderStatus, DeliveryMode } from '@yantar/shared'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { Order } from '../../domain/entities/order.entity'
import { OrderItem, OrderItemModifier } from '../../domain/entities/order-item.entity'
import { IOrderRepository } from '../../domain/ports/order-repository.port'

const ORDER_INCLUDE = { items: true }

type PrismaOrderRecord = {
  id: string
  companyId: string
  branchId: string
  customerId: string
  status: string
  deliveryMode: string
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
  items: PrismaItemRecord[]
}

type PrismaItemRecord = {
  id: string
  orderId: string
  dishId: string
  dishName: string
  quantity: number
  unitPrice: number
  selectedVariant: string | null
  selectedModifiers: unknown
  notes: string | null
  lineTotal: number
}

const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
]

@Injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(orderId: string, companyId: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      where: { id: orderId, companyId },
      include: ORDER_INCLUDE,
    })
    return record ? this.toDomain(record as unknown as PrismaOrderRecord) : null
  }

  async getByCustomer(
    customerId: string,
    companyId: string,
    limit = 20,
    offset = 0,
  ): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: { customerId, companyId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
    return records.map((r) => this.toDomain(r as unknown as PrismaOrderRecord))
  }

  async getActiveByBranch(branchId: string): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: { branchId, status: { in: ACTIVE_STATUSES } },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'asc' },
    })
    return records.map((r) => this.toDomain(r as unknown as PrismaOrderRecord))
  }

  async save(order: Order): Promise<Order> {
    const record = await this.prisma.$transaction(async (tx) => {
      await tx.order.upsert({
        where: { id: order.id },
        create: {
          id: order.id,
          companyId: order.companyId,
          branchId: order.branchId,
          customerId: order.customerId,
          status: order.status,
          deliveryMode: order.deliveryMode,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          discount: order.discount,
          total: order.total,
          notes: order.notes,
          deliveryAddress: order.deliveryAddress,
          scheduledTime: order.scheduledTime,
          rejectionReason: order.rejectionReason,
          estimatedMinutes: order.estimatedMinutes,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          confirmedAt: order.confirmedAt,
          completedAt: order.completedAt,
          updatedAt: order.updatedAt,
        },
        update: {
          status: order.status,
          rejectionReason: order.rejectionReason,
          estimatedMinutes: order.estimatedMinutes,
          confirmedAt: order.confirmedAt,
          completedAt: order.completedAt,
          updatedAt: order.updatedAt,
        },
      })

      // Items are immutable after creation — only insert if new order
      const existingCount = await tx.orderItem.count({ where: { orderId: order.id } })
      if (existingCount === 0 && order.items.length > 0) {
        await tx.orderItem.createMany({
          data: order.items.map((item) => ({
            id: item.id,
            orderId: item.orderId,
            dishId: item.dishId,
            dishName: item.dishName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            selectedVariant: item.selectedVariant,
            selectedModifiers: item.selectedModifiers,
            notes: item.notes,
            lineTotal: item.lineTotal,
          })),
        })
      }

      return tx.order.findFirstOrThrow({
        where: { id: order.id },
        include: ORDER_INCLUDE,
      })
    })

    return this.toDomain(record as unknown as PrismaOrderRecord)
  }

  private toDomain(record: PrismaOrderRecord): Order {
    const items = record.items.map(
      (i) =>
        new OrderItem({
          id: i.id,
          orderId: i.orderId,
          dishId: i.dishId,
          dishName: i.dishName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          selectedVariant: i.selectedVariant,
          selectedModifiers: (i.selectedModifiers as OrderItemModifier[]) ?? [],
          notes: i.notes,
        }),
    )

    return Order.restore({
      id: record.id,
      companyId: record.companyId,
      branchId: record.branchId,
      customerId: record.customerId,
      status: record.status as OrderStatus,
      deliveryMode: record.deliveryMode as DeliveryMode,
      items,
      subtotal: record.subtotal,
      deliveryFee: record.deliveryFee,
      discount: record.discount,
      total: record.total,
      notes: record.notes,
      deliveryAddress: record.deliveryAddress,
      scheduledTime: record.scheduledTime,
      rejectionReason: record.rejectionReason,
      estimatedMinutes: record.estimatedMinutes,
      paymentMethod: record.paymentMethod,
      createdAt: record.createdAt,
      confirmedAt: record.confirmedAt,
      completedAt: record.completedAt,
      updatedAt: record.updatedAt,
    })
  }
}
