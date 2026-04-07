import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import {
  ILoyaltyConfigRepository,
  LoyaltyRules,
} from '../../domain/ports/loyalty-config-repository.port'

@Injectable()
export class PrismaLoyaltyConfigRepository implements ILoyaltyConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getByCompany(companyId: string): Promise<LoyaltyRules | null> {
    const row = await this.prisma.loyaltyConfig.findUnique({
      where: { companyId },
    })
    if (!row) return null
    return {
      pointsPerEuro: row.pointsPerEuro,
      pointValueCents: row.pointValueCents,
      minRedeemPoints: row.minRedeemPoints,
      isEnabled: row.isEnabled,
    }
  }

  async upsert(companyId: string, rules: Partial<LoyaltyRules>): Promise<LoyaltyRules> {
    const row = await this.prisma.loyaltyConfig.upsert({
      where: { companyId },
      create: {
        companyId,
        pointsPerEuro: rules.pointsPerEuro ?? 1.0,
        pointValueCents: rules.pointValueCents ?? 1.0,
        minRedeemPoints: rules.minRedeemPoints ?? 100,
        isEnabled: rules.isEnabled ?? true,
      },
      update: {
        ...(rules.pointsPerEuro !== undefined && { pointsPerEuro: rules.pointsPerEuro }),
        ...(rules.pointValueCents !== undefined && { pointValueCents: rules.pointValueCents }),
        ...(rules.minRedeemPoints !== undefined && { minRedeemPoints: rules.minRedeemPoints }),
        ...(rules.isEnabled !== undefined && { isEnabled: rules.isEnabled }),
      },
    })
    return {
      pointsPerEuro: row.pointsPerEuro,
      pointValueCents: row.pointValueCents,
      minRedeemPoints: row.minRedeemPoints,
      isEnabled: row.isEnabled,
    }
  }
}
