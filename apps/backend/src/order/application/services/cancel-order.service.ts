import { Inject, Injectable } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { INotificationService } from '../../domain/ports/notification-service.port'
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error'
import { OrderResponse } from '../dtos/order.dto'

@Injectable()
export class CancelOrderService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) {}

  async execute(
    companyId: string,
    orderId: string,
    customerId: string,
    reason?: string,
  ): Promise<OrderResponse> {
    const order = await this.orderRepository.getById(orderId, companyId)
    if (!order) throw new OrderNotFoundError(orderId)

    const cancelled = order.cancel(reason)
    const saved = await this.orderRepository.save(cancelled)
    await this.notificationService.notifyOrderStatusChange(saved)

    return OrderResponse.fromEntity(saved)
  }
}
