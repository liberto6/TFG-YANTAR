import { DomainError } from '@yantar/shared'

export class EmailAlreadyInUseError extends DomainError {
  readonly code = 'EMAIL_ALREADY_IN_USE'

  constructor(email: string) {
    super(`Email already in use: ${email}`)
  }
}
