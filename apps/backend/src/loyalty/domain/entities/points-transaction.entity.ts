import { TransactionType } from '@yantar/shared'

export class PointsTransaction {
  id: string
  accountId: string
  type: TransactionType
  points: number
  reason: string
  orderId: string | null
  rewardId: string | null
  createdAt: Date

  constructor(props: {
    id: string
    accountId: string
    type: TransactionType
    points: number
    reason: string
    orderId?: string | null
    rewardId?: string | null
    createdAt?: Date
  }) {
    this.id = props.id
    this.accountId = props.accountId
    this.type = props.type
    this.points = props.points
    this.reason = props.reason
    this.orderId = props.orderId ?? null
    this.rewardId = props.rewardId ?? null
    this.createdAt = props.createdAt ?? new Date()
  }

  static createEarned(props: {
    id: string
    accountId: string
    points: number
    orderId: string
    reason: string
  }): PointsTransaction {
    return new PointsTransaction({
      ...props,
      type: TransactionType.EARNED,
    })
  }

  static createRedeemed(props: {
    id: string
    accountId: string
    points: number
    rewardId?: string
    reason: string
  }): PointsTransaction {
    return new PointsTransaction({
      ...props,
      type: TransactionType.REDEEMED,
    })
  }
}
