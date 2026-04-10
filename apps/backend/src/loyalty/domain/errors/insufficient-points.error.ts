import { DomainError } from '@yantar/shared'

export class InsufficientPointsError extends DomainError {
  readonly code = 'INSUFFICIENT_POINTS'

  constructor(available: number, required: number) {
    super(`Puntos insuficientes: tienes ${available}, necesitas ${required}`)
  }
}
