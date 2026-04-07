import { RewardType } from '@yantar/shared'
import { RewardNotAvailableError } from '../errors/reward-not-available.error'

export class Reward {
  id: string
  companyId: string
  name: string
  description: string | null
  type: RewardType
  pointsCost: number
  value: string
  isActive: boolean
  stock: number | null
  validFrom: Date | null
  validUntil: Date | null
  createdAt: Date
  updatedAt: Date

  constructor(props: {
    id: string
    companyId: string
    name: string
    description?: string | null
    type: RewardType
    pointsCost: number
    value: string
    isActive?: boolean
    stock?: number | null
    validFrom?: Date | null
    validUntil?: Date | null
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.companyId = props.companyId
    this.name = props.name
    this.description = props.description ?? null
    this.type = props.type
    this.pointsCost = props.pointsCost
    this.value = props.value
    this.isActive = props.isActive ?? true
    this.stock = props.stock ?? null
    this.validFrom = props.validFrom ?? null
    this.validUntil = props.validUntil ?? null
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  isAvailable(): boolean {
    if (!this.isActive) return false
    if (this.stock !== null && this.stock <= 0) return false
    const now = new Date()
    if (this.validFrom && now < this.validFrom) return false
    if (this.validUntil && now > this.validUntil) return false
    return true
  }

  consume(): void {
    if (!this.isAvailable()) {
      throw new RewardNotAvailableError(this.id)
    }
    if (this.stock !== null) {
      this.stock -= 1
    }
    this.updatedAt = new Date()
  }
}
