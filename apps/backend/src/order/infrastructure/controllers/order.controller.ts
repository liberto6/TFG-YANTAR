import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'
import { GetCurrentUserService } from '../../../identity/application/services/get-current-user.service'
import { CreateOrderService } from '../../application/services/create-order.service'
import { CancelOrderService } from '../../application/services/cancel-order.service'
import { GetOrderService } from '../../application/services/get-order.service'
import { GetOrderHistoryService } from '../../application/services/get-order-history.service'
import { CreateOrderRequest, CancelOrderRequest } from '../../application/dtos/create-order.dto'
import { OrderResponse } from '../../application/dtos/order.dto'

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    private readonly getCurrentUserService: GetCurrentUserService,
    private readonly createOrderService: CreateOrderService,
    private readonly cancelOrderService: CancelOrderService,
    private readonly getOrderService: GetOrderService,
    private readonly getOrderHistoryService: GetOrderHistoryService,
  ) {}

  private async getUserAndCompany(req: Request) {
    const userId = (req as any).userId as string
    const user = await this.getCurrentUserService.execute(userId)
    return user
  }

  @Post()
  async createOrder(
    @Req() req: Request,
    @Body() body: CreateOrderRequest,
  ): Promise<OrderResponse> {
    const user = await this.getUserAndCompany(req)
    return this.createOrderService.execute(user.companyId!, user.id, body)
  }

  @Get('history')
  async getHistory(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<OrderResponse[]> {
    const user = await this.getUserAndCompany(req)
    return this.getOrderHistoryService.execute(
      user.id,
      user.companyId!,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    )
  }

  @Get(':orderId')
  async getOrder(
    @Req() req: Request,
    @Param('orderId') orderId: string,
  ): Promise<OrderResponse> {
    const user = await this.getUserAndCompany(req)
    return this.getOrderService.execute(user.companyId!, orderId)
  }

  @Patch(':orderId/cancel')
  async cancelOrder(
    @Req() req: Request,
    @Param('orderId') orderId: string,
    @Body() body: CancelOrderRequest,
  ): Promise<OrderResponse> {
    const user = await this.getUserAndCompany(req)
    return this.cancelOrderService.execute(user.companyId!, orderId, user.id, body.reason)
  }
}
