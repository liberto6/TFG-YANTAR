import { DomainError } from '@yantar/shared'

export class AuthorizationError extends DomainError {
  readonly code = 'AUTHORIZATION_ERROR'

  constructor(message = 'You are not authorized to perform this action') {
    super(message)
  }
}
