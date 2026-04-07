import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'
import { GetCurrentUserService } from '../../../identity/application/services/get-current-user.service'
import { GetBalanceService } from '../../application/services/get-balance.service'
import { GetRewardsService } from '../../application/services/get-rewards.service'
import { GetPointsHistoryService } from '../../application/services/get-points-history.service'
import { RedeemPointsService } from '../../application/services/redeem-points.service'
import { LoyaltyAccountDto } from '../../application/dtos/loyalty-account.dto'
import { RewardDto } from '../../application/dtos/reward.dto'
import { TransactionDto } from '../../application/services/get-points-history.service'
import { RedeemPointsRequest } from '../../application/dtos/redeem.dto'

@Controller('loyalty')
@UseGuards(AuthGuard)
export class LoyaltyController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserService,
    private readonly getBalanceService: GetBalanceService,
    private readonly getRewardsService: GetRewardsService,
    private readonly getHistoryService: GetPointsHistoryService,
    private readonly redeemService: RedeemPointsService,
  ) {}

  @Get('balance')
  async getBalance(@Req() req: Request): Promise<LoyaltyAccountDto> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    return this.getBalanceService.execute(user.id, user.companyId!)
  }

  @Get('rewards')
  async getRewards(@Req() req: Request): Promise<RewardDto[]> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    return this.getRewardsService.execute(user.companyId!)
  }

  @Get('history')
  async getHistory(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<TransactionDto[]> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    return this.getHistoryService.execute(
      user.id,
      user.companyId!,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    )
  }

  @Post('redeem')
  async redeem(
    @Req() req: Request,
    @Body() body: RedeemPointsRequest,
  ): Promise<{ account: LoyaltyAccountDto; discountValue: number }> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    return this.redeemService.execute(
      user.id,
      user.companyId!,
      body.points,
      body.rewardId,
      body.reason,
    )
  }
}
