import { Injectable } from '@nestjs/common'
import { TransactionType } from '@yantar/shared'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { IPointsTransactionRepository } from '../../domain/ports/points-transaction-repository.port'
import { PointsTransaction } from '../../domain/entities/points-transaction.entity'

@Injectable()
export class PrismaPointsTransactionRepository implements IPointsTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: PointsTransaction): Promise<PointsTransaction> {
    const row = await this.prisma.pointsTransaction.create({
      data: {
        id: transaction.id,
        accountId: transaction.accountId,
        type: transaction.type,
        points: transaction.points,
        reason: transaction.reason,
        orderId: transaction.orderId,
        rewardId: transaction.rewardId,
      },
    })
    return this.toEntity(row)
  }

  async getHistory(
    accountId: string,
    limit = 20,
    offset = 0,
  ): Promise<PointsTransaction[]> {
    const rows = await this.prisma.pointsTransaction.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
    return rows.map((r) => this.toEntity(r))
  }

  private toEntity(row: any): PointsTransaction {
    return new PointsTransaction({
      id: row.id,
      accountId: row.accountId,
      type: row.type as TransactionType,
      points: row.points,
      reason: row.reason,
      orderId: row.orderId,
      rewardId: row.rewardId,
      createdAt: row.createdAt,
    })
  }
}
