import { DomainError } from '@yantar/shared'

export class DishNotFoundError extends DomainError {
  readonly code = 'DISH_NOT_FOUND'

  constructor(identifier: string) {
    super(`Dish not found: ${identifier}`)
  }
}
