import { Injectable } from '@nestjs/common'
import { ILoyaltyChecker } from '../../../order/domain/ports/loyalty-checker.port'
import { GetBalanceService } from '../../application/services/get-balance.service'
import { AwardPointsService } from '../../application/services/award-points.service'
import { RedeemPointsService } from '../../application/services/redeem-points.service'

@Injectable()
export class LoyaltyCheckerAdapter implements ILoyaltyChecker {
  constructor(
    private readonly getBalanceService: GetBalanceService,
    private readonly awardPointsService: AwardPointsService,
    private readonly redeemPointsService: RedeemPointsService,
  ) {}

  async getAvailablePoints(customerId: string, companyId: string): Promise<number> {
    const account = await this.getBalanceService.execute(customerId, companyId)
    return account.currentBalance
  }

  async redeemPoints(customerId: string, companyId: string, points: number): Promise<void> {
    await this.redeemPointsService.execute(customerId, companyId, points)
  }

  async awardPoints(
    customerId: string,
    companyId: string,
    orderTotal: number,
    orderId: string,
  ): Promise<number> {
    const account = await this.awardPointsService.execute(
      customerId,
      companyId,
      orderTotal,
      orderId,
    )
    return account.currentBalance
  }
}
