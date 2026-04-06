import { Inject, Injectable } from '@nestjs/common'
import { IDishRepository } from '../../domain/ports/dish-repository.port'
import { DishResponse } from '../dtos/dish.dto'

@Injectable()
export class ListDishesService {
  constructor(
    @Inject('IDishRepository')
    private readonly dishRepository: IDishRepository,
  ) {}

  async execute(companyId: string, categoryId?: string): Promise<DishResponse[]> {
    const dishes = await this.dishRepository.findByCompanyId(companyId, {
      categoryId,
    })
    return dishes.map(DishResponse.fromEntity)
  }
}
