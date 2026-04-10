import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { ILoyaltyAccountRepository } from '../../domain/ports/loyalty-account-repository.port'
import { LoyaltyAccount } from '../../domain/entities/loyalty-account.entity'

@Injectable()
export class PrismaLoyaltyAccountRepository implements ILoyaltyAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getByCustomer(customerId: string, companyId: string): Promise<LoyaltyAccount | null> {
    const row = await this.prisma.loyaltyAccount.findUnique({
      where: { customerId_companyId: { customerId, companyId } },
    })
    if (!row) return null
    return this.toEntity(row)
  }

  async getOrCreate(
    customerId: string,
    companyId: string,
    newId: string,
  ): Promise<LoyaltyAccount> {
    const row = await this.prisma.loyaltyAccount.upsert({
      where: { customerId_companyId: { customerId, companyId } },
      create: {
        id: newId,
        customerId,
        companyId,
      },
      update: {},
    })
    return this.toEntity(row)
  }

  async save(account: LoyaltyAccount): Promise<void> {
    await this.prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        currentBalance: account.currentBalance,
        totalPointsEarned: account.totalPointsEarned,
        totalPointsRedeemed: account.totalPointsRedeemed,
        lastActivityAt: account.lastActivityAt,
      },
    })
  }

  private toEntity(row: any): LoyaltyAccount {
    return new LoyaltyAccount({
      id: row.id,
      customerId: row.customerId,
      companyId: row.companyId,
      currentBalance: row.currentBalance,
      totalPointsEarned: row.totalPointsEarned,
      totalPointsRedeemed: row.totalPointsRedeemed,
      createdAt: row.createdAt,
      lastActivityAt: row.lastActivityAt,
    })
  }
}
