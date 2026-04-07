import { Injectable } from '@nestjs/common'
import { Order } from '../../domain/entities/order.entity'
import { INotificationService } from '../../domain/ports/notification-service.port'
import { OrderEventsGateway } from '../gateways/order-events.gateway'
import { OrderResponse } from '../../application/dtos/order.dto'

@Injectable()
export class WsNotificationAdapter implements INotificationService {
  constructor(private readonly gateway: OrderEventsGateway) {}

  async notifyNewOrder(order: Order): Promise<void> {
    const payload = OrderResponse.fromEntity(order)
    this.gateway.emitNewOrder(order.branchId, payload)
  }

  async notifyOrderStatusChange(order: Order): Promise<void> {
    const payload = OrderResponse.fromEntity(order)
    this.gateway.emitStatusChanged(order.id, order.branchId, payload)
  }
}
