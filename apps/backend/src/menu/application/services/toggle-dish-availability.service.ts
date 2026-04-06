import { Inject, Injectable } from '@nestjs/common'
import { IDishRepository } from '../../domain/ports/dish-repository.port'
import { DishNotFoundError } from '../../domain/errors/dish-not-found.error'
import { DishResponse } from '../dtos/dish.dto'

@Injectable()
export class ToggleDishAvailabilityService {
  constructor(
    @Inject('IDishRepository')
    private readonly dishRepository: IDishRepository,
  ) {}

  async execute(companyId: string, dishId: string): Promise<DishResponse> {
    const dish = await this.dishRepository.findById(dishId, companyId)
    if (!dish) {
      throw new DishNotFoundError(dishId)
    }

    const toggled = dish.toggleAvailability()
    const saved = await this.dishRepository.save(toggled)
    return DishResponse.fromEntity(saved)
  }
}
