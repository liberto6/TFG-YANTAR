import { Injectable } from '@nestjs/common'
import { RewardType } from '@yantar/shared'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { IRewardRepository } from '../../domain/ports/reward-repository.port'
import { Reward } from '../../domain/entities/reward.entity'

@Injectable()
export class PrismaRewardRepository implements IRewardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailable(companyId: string): Promise<Reward[]> {
    const rows = await this.prisma.reward.findMany({
      where: { companyId, isActive: true },
      orderBy: { pointsCost: 'asc' },
    })
    return rows.map((r) => this.toEntity(r))
  }

  async getById(rewardId: string, companyId: string): Promise<Reward | null> {
    const row = await this.prisma.reward.findFirst({
      where: { id: rewardId, companyId },
    })
    return row ? this.toEntity(row) : null
  }

  async create(reward: Reward): Promise<Reward> {
    const row = await this.prisma.reward.create({
      data: {
        id: reward.id,
        companyId: reward.companyId,
        name: reward.name,
        description: reward.description,
        type: reward.type,
        pointsCost: reward.pointsCost,
        value: reward.value,
        isActive: reward.isActive,
        stock: reward.stock,
        validFrom: reward.validFrom,
        validUntil: reward.validUntil,
      },
    })
    return this.toEntity(row)
  }

  async update(reward: Reward): Promise<Reward> {
    const row = await this.prisma.reward.update({
      where: { id: reward.id },
      data: {
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost,
        value: reward.value,
        isActive: reward.isActive,
        stock: reward.stock,
        validFrom: reward.validFrom,
        validUntil: reward.validUntil,
        updatedAt: new Date(),
      },
    })
    return this.toEntity(row)
  }

  async delete(rewardId: string, companyId: string): Promise<void> {
    await this.prisma.reward.deleteMany({ where: { id: rewardId, companyId } })
  }

  private toEntity(row: any): Reward {
    return new Reward({
      id: row.id,
      companyId: row.companyId,
      name: row.name,
      description: row.description,
      type: row.type as RewardType,
      pointsCost: row.pointsCost,
      value: row.value,
      isActive: row.isActive,
      stock: row.stock,
      validFrom: row.validFrom,
      validUntil: row.validUntil,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
