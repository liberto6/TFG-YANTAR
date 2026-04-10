import { Inject, Injectable } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { OrderNotFoundError } from '../../domain/errors/order-not-found.error'
import { OrderResponse } from '../dtos/order.dto'

@Injectable()
export class GetOrderService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(companyId: string, orderId: string): Promise<OrderResponse> {
    const order = await this.orderRepository.getById(orderId, companyId)
    if (!order) throw new OrderNotFoundError(orderId)
    return OrderResponse.fromEntity(order)
  }
}
