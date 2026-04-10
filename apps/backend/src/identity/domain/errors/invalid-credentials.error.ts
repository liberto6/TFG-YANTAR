import { DomainError } from '@yantar/shared'

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS'

  constructor() {
    super('Email o contraseña incorrectos')
  }
}
