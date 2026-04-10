import { DomainError } from '@yantar/shared'

export class EmptyCartError extends DomainError {
  readonly code = 'EMPTY_CART'
  constructor() {
    super('Cannot create order with an empty cart')
  }
}
