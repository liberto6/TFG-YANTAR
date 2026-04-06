import { DomainError } from '@yantar/shared'

export class DeliveryZoneNotFoundError extends DomainError {
  readonly code = 'DELIVERY_ZONE_NOT_FOUND'

  constructor(identifier: string) {
    super(`Delivery zone not found: ${identifier}`)
  }
}
