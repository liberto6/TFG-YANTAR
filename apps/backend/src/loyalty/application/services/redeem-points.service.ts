import { Injectable, Inject } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ILoyaltyAccountRepository } from '../../domain/ports/loyalty-account-repository.port'
import { IPointsTransactionRepository } from '../../domain/ports/points-transaction-repository.port'
import { IRewardRepository } from '../../domain/ports/reward-repository.port'
import { ILoyaltyConfigRepository } from '../../domain/ports/loyalty-config-repository.port'
import { PointsTransaction } from '../../domain/entities/points-transaction.entity'
import { PointsCalculationService } from '../../domain/services/points-calculation.service'
import { UserNotFoundError } from '../../../identity/domain/errors/user-not-found.error'
import { LoyaltyAccountDto } from '../dtos/loyalty-account.dto'

export class RedeemResult {
  account!: LoyaltyAccountDto
  discountValue!: number
}

@Injectable()
export class RedeemPointsService {
  constructor(
    @Inject('ILoyaltyAccountRepository')
    private readonly accountRepository: ILoyaltyAccountRepository,
    @Inject('IPointsTransactionRepository')
    private readonly transactionRepository: IPointsTransactionRepository,
    @Inject('IRewardRepository')
    private readonly rewardRepository: IRewardRepository,
    @Inject('ILoyaltyConfigRepository')
    private readonly configRepository: ILoyaltyConfigRepository,
  ) {}

  async execute(
    customerId: string,
    companyId: string,
    points: number,
    rewardId?: string,
    reason?: string,
  ): Promise<RedeemResult> {
    const account = await this.accountRepository.getByCustomer(customerId, companyId)
    if (!account) throw new UserNotFoundError(customerId)

    // Consume reward stock if provided
    if (rewardId) {
      const reward = await this.rewardRepository.getById(rewardId, companyId)
      if (reward) {
        reward.consume()
        await this.rewardRepository.update(reward)
      }
    }

    account.redeem(points)
    await this.accountRepository.save(account)

    const transaction = PointsTransaction.createRedeemed({
      id: randomUUID(),
      accountId: account.id,
      points,
      rewardId,
      reason: reason ?? `Canje de ${points} puntos`,
    })
    await this.transactionRepository.create(transaction)

    const rules = await this.configRepository.getByCompany(companyId)
    const discountValue = rules
      ? PointsCalculationService.calculateDiscountValue(points, rules)
      : 0

    return {
      account: LoyaltyAccountDto.fromEntity(account),
      discountValue,
    }
  }
}
