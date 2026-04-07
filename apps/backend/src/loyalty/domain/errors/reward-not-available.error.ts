import { DomainError } from '@yantar/shared'

export class RewardNotAvailableError extends DomainError {
  readonly code = 'REWARD_NOT_AVAILABLE'

  constructor(rewardId: string) {
    super(`La recompensa ${rewardId} no esta disponible`)
  }
}
