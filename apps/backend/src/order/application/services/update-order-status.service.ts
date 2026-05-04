import { Inject, Injectable, Logger, Optional } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { INotificationService } from '../../domain/ports/notification-service.port'
import { ILoyaltyChecker } from '../../domain/ports/loyalty-checker.port'
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error'
import { InvalidOrderTransitionError } from '../../domain/errors/invalid-order-transition.error'
import { OrderResponse } from '../dtos/order.dto'

export type OrderStatusAction = 'startPreparing' | 'markReady' | 'markDelivered'

@Injectable()
export class UpdateOrderStatusService {
  private readonly logger = new Logger(UpdateOrderStatusService.name)

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

    // Acumulación automática de puntos al marcar el pedido como entregado.
    // Los errores del subsistema de fidelización se registran pero no
    // hacen fallar el cambio de estado del pedido.
    if (action === 'markDelivered' && this.loyaltyChecker) {
      try {
        await this.loyaltyChecker.awardPoints(
          saved.customerId,
          saved.companyId,
          saved.total,
          saved.id,
        )
      } catch (error) {
        this.logger.warn(
          `No se pudieron acumular puntos para el pedido ${saved.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        )
      }
    }

    return OrderResponse.fromEntity(saved)
  }
}
