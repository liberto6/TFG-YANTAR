import { Inject, Injectable } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { OrderResponse } from '../dtos/order.dto'

@Injectable()
export class GetOrderHistoryService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(
    customerId: string,
    companyId: string,
    limit = 20,
    offset = 0,
  ): Promise<OrderResponse[]> {
    const orders = await this.orderRepository.getByCustomer(
      customerId,
      companyId,
      limit,
      offset,
    )
    return orders.map(OrderResponse.fromEntity)
  }
}
