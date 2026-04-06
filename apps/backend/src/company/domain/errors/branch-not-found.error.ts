import { DomainError } from '@yantar/shared'

export class BranchNotFoundError extends DomainError {
  readonly code = 'BRANCH_NOT_FOUND'

  constructor(identifier: string) {
    super(`Branch not found: ${identifier}`)
  }
}
