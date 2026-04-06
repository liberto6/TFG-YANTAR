import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { DeliveryMode } from '@yantar/shared'
import { Order } from '../../domain/entities/order.entity'
import { OrderItem } from '../../domain/entities/order-item.entity'
import { IOrderRepository } from '../../domain/ports/order-repository.port'
import { INotificationService } from '../../domain/ports/notification-service.port'
import { IDishCheckerPort } from '../../domain/ports/dish-checker.port'
import { EmptyCartError } from '../../domain/errors/empty-cart.error'
import { DishNotFoundError } from '../../../menu/domain/errors/dish-not-found.error'
import { CreateOrderRequest, CartItemDto } from '../dtos/create-order.dto'
import { OrderResponse } from '../dtos/order.dto'

@Injectable()
export class CreateOrderService {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
    @Inject('IDishCheckerPort')
    private readonly dishChecker: IDishCheckerPort,
  ) {}

  async execute(
    companyId: string,
    customerId: string,
    request: CreateOrderRequest,
  ): Promise<OrderResponse> {
    if (!request.items || request.items.length === 0) {
      throw new EmptyCartError()
    }

    const orderId = randomUUID()
    const items = await this.buildOrderItems(orderId, companyId, request.items)

    const subtotal = Math.round(
      items.reduce((sum, item) => sum + item.lineTotal, 0) * 100,
    ) / 100

    const deliveryFee =
      request.deliveryMode === DeliveryMode.DELIVERY
        ? (request.deliveryFee ?? 0)
        : 0

    const total = Math.round((subtotal + deliveryFee) * 100) / 100

    const order = Order.create({
      id: orderId,
      companyId,
      branchId: request.branchId,
      customerId,
      deliveryMode: request.deliveryMode,
      items,
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      notes: request.notes,
      deliveryAddress: request.deliveryAddress,
      scheduledTime: request.scheduledTime ? new Date(request.scheduledTime) : null,
      paymentMethod: request.paymentMethod,
    })

    const saved = await this.orderRepository.save(order)
    await this.notificationService.notifyNewOrder(saved)

    return OrderResponse.fromEntity(saved)
  }

  private async buildOrderItems(
    orderId: string,
    companyId: string,
    cartItems: CartItemDto[],
  ): Promise<OrderItem[]> {
    const items: OrderItem[] = []

    for (const cartItem of cartItems) {
      const dishInfo = await this.dishChecker.getActiveDishInfo(
        cartItem.dishId,
        companyId,
      )

      if (!dishInfo) {
        throw new DishNotFoundError(cartItem.dishId)
      }

      // Resolve variant
      let variantName: string | null = null
      let variantPriceAdjustment = 0

      if (cartItem.selectedVariantOptionId) {
        for (const group of dishInfo.variantGroups) {
          const option = group.options.find(
            (o) => o.id === cartItem.selectedVariantOptionId,
          )
          if (option) {
            variantName = option.name
            variantPriceAdjustment = option.priceAdjustment
            break
          }
        }
      }

      // Resolve modifiers
      const selectedModifiers: { name: string; price: number }[] = []
      let modifierTotal = 0

      if (cartItem.selectedModifierOptionIds?.length) {
        for (const group of dishInfo.modifierGroups) {
          for (const optionId of cartItem.selectedModifierOptionIds) {
            const option = group.options.find((o) => o.id === optionId)
            if (option) {
              selectedModifiers.push({ name: option.name, price: option.extraPrice })
              modifierTotal += option.extraPrice
            }
          }
        }
      }

      const unitPrice =
        Math.round((dishInfo.basePrice + variantPriceAdjustment + modifierTotal) * 100) / 100

      items.push(
        new OrderItem({
          id: randomUUID(),
          orderId,
          dishId: cartItem.dishId,
          dishName: dishInfo.name,
          quantity: cartItem.quantity,
          unitPrice,
          selectedVariant: variantName,
          selectedModifiers,
          notes: cartItem.notes ?? null,
        }),
      )
    }

    return items
  }
}
