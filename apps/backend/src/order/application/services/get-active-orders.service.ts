import { Inject, Injectable } from '@nestjs/common'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { OrderResponse } from '../dtos/order.dto'

@Injectable()
export class GetActiveOrdersService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(branchId: string): Promise<OrderResponse[]> {
    const orders = await this.orderRepository.getActiveByBranch(branchId)
    return orders.map(OrderResponse.fromEntity)
  }
}
