import { InsufficientPointsError } from '../errors/insufficient-points.error'

export class LoyaltyAccount {
  id: string
  customerId: string
  companyId: string
  totalPointsEarned: number
  totalPointsRedeemed: number
  currentBalance: number
  createdAt: Date
  lastActivityAt: Date

  constructor(props: {
    id: string
    customerId: string
    companyId: string
    totalPointsEarned?: number
    totalPointsRedeemed?: number
    currentBalance?: number
    createdAt?: Date
    lastActivityAt?: Date
  }) {
    this.id = props.id
    this.customerId = props.customerId
    this.companyId = props.companyId
    this.totalPointsEarned = props.totalPointsEarned ?? 0
    this.totalPointsRedeemed = props.totalPointsRedeemed ?? 0
    this.currentBalance = props.currentBalance ?? 0
    this.createdAt = props.createdAt ?? new Date()
    this.lastActivityAt = props.lastActivityAt ?? new Date()
  }

  static create(customerId: string, companyId: string, id: string): LoyaltyAccount {
    return new LoyaltyAccount({ id, customerId, companyId })
  }

  canRedeem(points: number): boolean {
    return this.currentBalance >= points
  }

  award(points: number): void {
    if (points <= 0) return
    this.currentBalance += points
    this.totalPointsEarned += points
    this.lastActivityAt = new Date()
  }

  redeem(points: number): void {
    if (!this.canRedeem(points)) {
      throw new InsufficientPointsError(this.currentBalance, points)
    }
    this.currentBalance -= points
    this.totalPointsRedeemed += points
    this.lastActivityAt = new Date()
  }
}
