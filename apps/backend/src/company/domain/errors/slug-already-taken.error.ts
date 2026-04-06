import { DomainError } from '@yantar/shared'

export class SlugAlreadyTakenError extends DomainError {
  readonly code = 'SLUG_ALREADY_TAKEN'

  constructor(slug: string) {
    super(`Slug already taken: ${slug}`)
  }
}
