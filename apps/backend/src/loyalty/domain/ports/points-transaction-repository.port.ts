import { PointsTransaction } from '../entities/points-transaction.entity'

export interface IPointsTransactionRepository {
  create(transaction: PointsTransaction): Promise<PointsTransaction>
  getHistory(
    accountId: string,
    limit?: number,
    offset?: number,
  ): Promise<PointsTransaction[]>
}
