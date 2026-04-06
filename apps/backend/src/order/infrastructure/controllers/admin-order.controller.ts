import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'
import { AdminGuard } from '../../../shared/infrastructure/guards/admin.guard'
import { GetCurrentUserService } from '../../../identity/application/services/get-current-user.service'
import { AcceptOrderService } from '../../application/services/accept-order.service'
import { RejectOrderService } from '../../application/services/reject-order.service'
import { UpdateOrderStatusService } from '../../application/services/update-order-status.service'
import { GetOrderService } from '../../application/services/get-order.service'
import { GetActiveOrdersService } from '../../application/services/get-active-orders.service'
import {
  AcceptOrderRequest,
  RejectOrderRequest,
} from '../../application/dtos/create-order.dto'
import { OrderResponse } from '../../application/dtos/order.dto'

@Controller('admin/orders')
@UseGuards(AuthGuard, AdminGuard)
export class AdminOrderController {
  constructor(
    private readonly getCurrentUserService: GetCurrentUserService,
    private readonly acceptOrderService: AcceptOrderService,
    private readonly rejectOrderService: RejectOrderService,
    private readonly updateOrderStatusService: UpdateOrderStatusService,
    private readonly getOrderService: GetOrderService,
    private readonly getActiveOrdersService: GetActiveOrdersService,
  ) {}

  private async getCompanyId(req: Request): Promise<string> {
    const userId = (req as any).userId as string
    const user = await this.getCurrentUserService.execute(userId)
    return user.companyId!
  }

  @Get('active')
  async getActiveOrders(
    @Req() req: Request,
    @Query('branchId') branchId: string,
  ): Promise<OrderResponse[]> {
    void req
    return this.getActiveOrdersService.execute(branchId)
  }

  @Get(':orderId')
  async getOrder(
    @Req() req: Request,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponse> {
    const companyId = await this.getCompanyId(req)
    return this.getOrderService.execute(companyId, orderId)
  }

  @Patch(':orderId/accept')
  async acceptOrder(
    @Req() req: Request,
    @Param('orderId') orderId: string,
    @Body() body: AcceptOrderRequest,
  ): Promise<OrderResponse> {
    const companyId = await this.getCompanyId(req)
    return this.acceptOrderService.execute(companyId, orderId, body.estimatedMinutes)
  }

  @Patch(':orderId/reject')
  async rejectOrder(
    @Req() req: Request,
    @Param('orderId') orderId: string,
    @Body() body: RejectOrderRequest,
  ): Promise<OrderResponse> {
    const companyId = await this.getCompanyId(req)
    return this.rejectOrderService.execute(companyId, orderId, body.reason)
  }

  @Patch(':orderId/preparing')
  async startPreparing(
    @Req() req: Request,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponse> {
    const companyId = await this.getCompanyId(req)
    return this.updateOrderStatusService.execute(companyId, orderId, 'startPreparing')
  }

  @Patch(':orderId/ready')
  async markReady(
    @Req() req: Request,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponse> {
    const companyId = await this.getCompanyId(req)
    return this.updateOrderStatusService.execute(companyId, orderId, 'markReady')
  }

  @Patch(':orderId/delivered')
  async markDelivered(
    @Req() req: Request,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponse> {
    const companyId = await this.getCompanyId(req)
    return this.updateOrderStatusService.execute(companyId, orderId, 'markDelivered')
  }
}
