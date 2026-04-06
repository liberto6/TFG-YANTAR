import { Order } from '../entities/order.entity'

export interface IOrderRepository {
  getById(orderId: string, companyId: string): Promise<Order | null>
  getByCustomer(
    customerId: string,
    companyId: string,
    limit?: number,
    offset?: number,
  ): Promise<Order[]>
  getActiveByBranch(branchId: string): Promise<Order[]>
  save(order: Order): Promise<Order>
}
