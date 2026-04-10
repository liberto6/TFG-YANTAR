import { Inject, Injectable } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { INotificationService } from '../../domain/ports/notification-service.port'
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error'
import { OrderResponse } from '../dtos/order.dto'

@Injectable()
export class AcceptOrderService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) {}

  async execute(
    companyId: string,
    orderId: string,
    estimatedMinutes: number,
  ): Promise<OrderResponse> {
    const order = await this.orderRepository.getById(orderId, companyId)
    if (!order) throw new OrderNotFoundError(orderId)

    const accepted = order.accept(estimatedMinutes)
    const saved = await this.orderRepository.save(accepted)
    await this.notificationService.notifyOrderStatusChange(saved)

    return OrderResponse.fromEntity(saved)
  }
}
