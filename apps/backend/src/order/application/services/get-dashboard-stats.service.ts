import { Inject, Injectable } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { OrderStatus } from '@yantar/shared'

export interface DashboardStatsResponse {
  ordersTotal: number
  revenue: number
  avgTicket: number
  deliveredCount: number
  activeCount: number
  cancelledCount: number
}

const ACTIVE_STATUSES = new Set([
  OrderStatus.PENDING,
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
])

const CANCELLED_STATUSES = new Set([
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
])

@Injectable()
export class GetDashboardStatsService {
  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(branchId: string, date: Date): Promise<DashboardStatsResponse> {
    const orders = await this.orderRepository.getByBranchAndDate(branchId, date)

    const delivered = orders.filter((o) => o.status === OrderStatus.DELIVERED)
    const revenue = delivered.reduce((sum, o) => sum + o.total, 0)

    return {
      ordersTotal: orders.length,
      revenue,
      avgTicket: delivered.length > 0 ? revenue / delivered.length : 0,
      deliveredCount: delivered.length,
      activeCount: orders.filter((o) => ACTIVE_STATUSES.has(o.status)).length,
      cancelledCount: orders.filter((o) => CANCELLED_STATUSES.has(o.status)).length,
    }
  }
}
