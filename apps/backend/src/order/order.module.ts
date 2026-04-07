import { Module, forwardRef } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module'
import { MenuModule } from '../menu/menu.module'
import { LoyaltyModule } from '../loyalty/loyalty.module'
import { OrderController } from './infrastructure/controllers/order.controller'
import { AdminOrderController } from './infrastructure/controllers/admin-order.controller'
import { CreateOrderService } from './application/services/create-order.service'
import { AcceptOrderService } from './application/services/accept-order.service'
import { RejectOrderService } from './application/services/reject-order.service'
import { UpdateOrderStatusService } from './application/services/update-order-status.service'
import { CancelOrderService } from './application/services/cancel-order.service'
import { GetOrderService } from './application/services/get-order.service'
import { GetOrderHistoryService } from './application/services/get-order-history.service'
import { GetActiveOrdersService } from './application/services/get-active-orders.service'
import { PrismaOrderRepository } from './infrastructure/repositories/prisma-order.repository'
import { WsNotificationAdapter } from './infrastructure/adapters/ws-notification.adapter'
import { MenuDishCheckerAdapter } from './infrastructure/adapters/menu-dish-checker.adapter'
import { OrderEventsGateway } from './infrastructure/gateways/order-events.gateway'
import { AdminGuard } from '../shared/infrastructure/guards/admin.guard'

@Module({
  imports: [forwardRef(() => IdentityModule), MenuModule, forwardRef(() => LoyaltyModule)],
  controllers: [OrderController, AdminOrderController],
  providers: [
    OrderEventsGateway,
    CreateOrderService,
    AcceptOrderService,
    RejectOrderService,
    UpdateOrderStatusService,
    CancelOrderService,
    GetOrderService,
    GetOrderHistoryService,
    GetActiveOrdersService,
    {
      provide: 'IOrderRepository',
      useClass: PrismaOrderRepository,
    },
    {
      provide: 'INotificationService',
      useClass: WsNotificationAdapter,
    },
    {
      provide: 'IDishCheckerPort',
      useClass: MenuDishCheckerAdapter,
    },
    AdminGuard,
  ],
})
export class OrderModule {}
