import { Injectable } from '@nestjs/common'
import { Order } from '../../domain/entities/order.entity'
import { INotificationService } from '../../domain/ports/notification-service.port'

/**
 * Null adapter — WebSocket real se implementa en Sprint 6.
 * Los eventos se loguean a consola para facilitar el debugging.
 */
@Injectable()
export class NullNotificationAdapter implements INotificationService {
  async notifyNewOrder(order: Order): Promise<void> {
    console.log(`[Order] New order: ${order.id} (branch: ${order.branchId})`)
  }

  async notifyOrderStatusChange(order: Order): Promise<void> {
    console.log(`[Order] Status changed: ${order.id} → ${order.status}`)
  }
}
