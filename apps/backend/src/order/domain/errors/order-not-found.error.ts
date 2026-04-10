import { DomainError } from '@yantar/shared'

export class OrderNotFoundError extends DomainError {
  readonly code = 'ORDER_NOT_FOUND'
  constructor(identifier: string) {
    super(`Order not found: ${identifier}`)
  }
}
