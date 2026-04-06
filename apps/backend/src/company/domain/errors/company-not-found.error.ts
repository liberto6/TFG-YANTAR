import { DomainError } from '@yantar/shared'

export class CompanyNotFoundError extends DomainError {
  readonly code = 'COMPANY_NOT_FOUND'

  constructor(identifier: string) {
    super(`Company not found: ${identifier}`)
  }
}
