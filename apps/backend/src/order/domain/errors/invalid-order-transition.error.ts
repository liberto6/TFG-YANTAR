import { DomainError } from '@yantar/shared'

export class InvalidOrderTransitionError extends DomainError {
  readonly code = 'INVALID_ORDER_TRANSITION'
  constructor(from: string, to: string) {
    super(`Cannot transition order from ${from} to ${to}`)
  }
}
