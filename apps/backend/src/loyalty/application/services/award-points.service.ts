import { Injectable, Inject } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { TransactionType } from '@yantar/shared'
import { ILoyaltyAccountRepository } from '../../domain/ports/loyalty-account-repository.port'
import { IPointsTransactionRepository } from '../../domain/ports/points-transaction-repository.port'
import { ILoyaltyConfigRepository } from '../../domain/ports/loyalty-config-repository.port'
import { PointsTransaction } from '../../domain/entities/points-transaction.entity'
import { PointsCalculationService } from '../../domain/services/points-calculation.service'
import { LoyaltyAccountDto } from '../dtos/loyalty-account.dto'

@Injectable()
export class AwardPointsService {
  constructor(
    @Inject('ILoyaltyAccountRepository')
    private readonly accountRepository: ILoyaltyAccountRepository,
    @Inject('IPointsTransactionRepository')
    private readonly transactionRepository: IPointsTransactionRepository,
    @Inject('ILoyaltyConfigRepository')
    private readonly configRepository: ILoyaltyConfigRepository,
  ) {}

  async execute(
    customerId: string,
    companyId: string,
    orderTotal: number,
    orderId: string,
  ): Promise<LoyaltyAccountDto> {
    const rules = await this.configRepository.getByCompany(companyId)
    if (!rules || !rules.isEnabled) {
      const account = await this.accountRepository.getOrCreate(
        customerId,
        companyId,
        randomUUID(),
      )
      return LoyaltyAccountDto.fromEntity(account)
    }

    const points = PointsCalculationService.calculatePointsForOrder(orderTotal, rules)
    if (points <= 0) {
      const account = await this.accountRepository.getOrCreate(
        customerId,
        companyId,
        randomUUID(),
      )
      return LoyaltyAccountDto.fromEntity(account)
    }

    const account = await this.accountRepository.getOrCreate(
      customerId,
      companyId,
      randomUUID(),
    )
    account.award(points)
    await this.accountRepository.save(account)

    const transaction = PointsTransaction.createEarned({
      id: randomUUID(),
      accountId: account.id,
      points,
      orderId,
      reason: `Pedido #${orderId.slice(0, 8)}`,
    })
    await this.transactionRepository.create(transaction)

    return LoyaltyAccountDto.fromEntity(account)
  }
}
