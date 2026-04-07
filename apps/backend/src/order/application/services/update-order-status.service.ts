import { Inject, Injectable, Optional } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { INotificationService } from '../../domain/ports/notification-service.port'
import { ILoyaltyChecker } from '../../domain/ports/loyalty-checker.port'
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error'
import { InvalidOrderTransitionError } from '../../domain/errors/invalid-order-transition.error'
import { OrderResponse } from '../dtos/order.dto'

export type OrderStatusAction = 'startPreparing' | 'markReady' | 'markDelivered'

@Injectable()
export class UpdateOrderStatusService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
    @Optional()
    @Inject('ILoyaltyChecker')
    private readonly loyaltyChecker: ILoyaltyChecker | null,
  ) {}

  async execute(
    companyId: string,
    orderId: string,
    action: OrderStatusAction,
  ): Promise<OrderResponse> {
    const order = await this.orderRepository.getById(orderId, companyId)
    if (!order) throw new OrderNotFoundError(orderId)

    let updated = order
    if (action === 'startPreparing') updated = order.startPreparing()
    else if (action === 'markReady') updated = order.markReady()
    else if (action === 'markDelivered') updated = order.markDelivered()
    else throw new InvalidOrderTransitionError(order.status, action)

    const saved = await this.orderRepository.save(updated)
    await this.notificationService.notifyOrderStatusChange(saved)

    // Award loyalty points when order is delivered
    if (action === 'markDelivered' && this.loyaltyChecker) {
      try {
        await this.loyaltyChecker.awardPoints(
          saved.customerId,
          saved.companyId,
          saved.total,
          saved.id,
        )
      } catch {
        // Loyalty errors are non-critical — do not fail the status update
      }
    }

    return OrderResponse.fromEntity(saved)
  }
}
