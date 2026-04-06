import { Inject, Injectable } from '@nestjs/common'
import { IDishRepository } from '../../domain/ports/dish-repository.port'
import { DishNotFoundError } from '../../domain/errors/dish-not-found.error'

@Injectable()
export class DeleteDishService {
  constructor(
    @Inject('IDishRepository')
    private readonly dishRepository: IDishRepository,
  ) {}

  async execute(companyId: string, dishId: string): Promise<void> {
    const dish = await this.dishRepository.findById(dishId, companyId)
    if (!dish) {
      throw new DishNotFoundError(dishId)
    }

    await this.dishRepository.delete(dishId, companyId)
  }
}
