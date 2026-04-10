import { Injectable, Inject } from '@nestjs/common'
import { TransactionType } from '@yantar/shared'
import { ILoyaltyAccountRepository } from '../../domain/ports/loyalty-account-repository.port'
import { IPointsTransactionRepository } from '../../domain/ports/points-transaction-repository.port'
import { PointsTransaction } from '../../domain/entities/points-transaction.entity'

export class TransactionDto {
  id!: string
  type!: TransactionType
  points!: number
  reason!: string
  orderId!: string | null
  rewardId!: string | null
  createdAt!: Date

  static fromEntity(tx: PointsTransaction): TransactionDto {
    const dto = new TransactionDto()
    dto.id = tx.id
    dto.type = tx.type
    dto.points = tx.points
    dto.reason = tx.reason
    dto.orderId = tx.orderId
    dto.rewardId = tx.rewardId
    dto.createdAt = tx.createdAt
    return dto
  }
}

@Injectable()
export class GetPointsHistoryService {
  constructor(
    @Inject('ILoyaltyAccountRepository')
    private readonly accountRepository: ILoyaltyAccountRepository,
    @Inject('IPointsTransactionRepository')
    private readonly transactionRepository: IPointsTransactionRepository,
  ) {}

  async execute(
    customerId: string,
    companyId: string,
    limit = 20,
    offset = 0,
  ): Promise<TransactionDto[]> {
    const account = await this.accountRepository.getByCustomer(customerId, companyId)
    if (!account) return []
    const txs = await this.transactionRepository.getHistory(account.id, limit, offset)
    return txs.map(TransactionDto.fromEntity)
  }
}
