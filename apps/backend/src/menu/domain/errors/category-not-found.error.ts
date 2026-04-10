import { DomainError } from '@yantar/shared'

export class CategoryNotFoundError extends DomainError {
  readonly code = 'CATEGORY_NOT_FOUND'

  constructor(identifier: string) {
    super(`Category not found: ${identifier}`)
  }
}
