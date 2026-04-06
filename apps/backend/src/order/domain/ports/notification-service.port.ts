import { Order } from '../entities/order.entity'

export interface INotificationService {
  notifyNewOrder(order: Order): Promise<void>
  notifyOrderStatusChange(order: Order): Promise<void>
}
