import { LoyaltyAccount } from '../../domain/entities/loyalty-account.entity'

export class LoyaltyAccountDto {
  id!: string
  customerId!: string
  companyId!: string
  currentBalance!: number
  totalPointsEarned!: number
  totalPointsRedeemed!: number
  lastActivityAt!: Date

  static fromEntity(account: LoyaltyAccount): LoyaltyAccountDto {
    const dto = new LoyaltyAccountDto()
    dto.id = account.id
    dto.customerId = account.customerId
    dto.companyId = account.companyId
    dto.currentBalance = account.currentBalance
    dto.totalPointsEarned = account.totalPointsEarned
    dto.totalPointsRedeemed = account.totalPointsRedeemed
    dto.lastActivityAt = account.lastActivityAt
    return dto
  }
}
