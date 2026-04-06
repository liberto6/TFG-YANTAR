import { Inject, Injectable } from '@nestjs/common'
import { DishStatus } from '@yantar/shared'
import { IDishRepository } from '../../domain/ports/dish-repository.port'
import { ICategoryRepository } from '../../domain/ports/category-repository.port'
import { AllergenFilterService } from '../../../allergen/domain/services/allergen-filter.service'
import { CategoryResponse } from '../dtos/category.dto'
import { DishResponse } from '../dtos/dish.dto'

export class MenuResponse {
  categories!: (CategoryResponse & { dishes: DishResponse[] })[]
}

@Injectable()
export class GetMenuService {
  private readonly allergenFilter = new AllergenFilterService()

  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    @Inject('IDishRepository')
    private readonly dishRepository: IDishRepository,
  ) {}

  async execute(
    companyId: string,
    excludeAllergenCodes: string[] = [],
  ): Promise<MenuResponse> {
    const [categories, allDishes] = await Promise.all([
      this.categoryRepository.findByCompanyId(companyId),
      this.dishRepository.findByCompanyId(companyId, { status: DishStatus.ACTIVE }),
    ])

    const dishes =
      excludeAllergenCodes.length > 0
        ? this.allergenFilter.filterSafeDishes(allDishes, excludeAllergenCodes)
        : allDishes

    const activeCategories = categories.filter((c) => c.isActive)
    const dishesByCategory = new Map<string, DishResponse[]>()

    for (const dish of dishes) {
      const list = dishesByCategory.get(dish.categoryId) ?? []
      list.push(DishResponse.fromEntity(dish))
      dishesByCategory.set(dish.categoryId, list)
    }

    const result: MenuResponse = {
      categories: activeCategories
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((category) => ({
          ...CategoryResponse.fromEntity(category),
          dishes: (dishesByCategory.get(category.id) ?? []).sort(
            (a, b) => a.sortOrder - b.sortOrder,
          ),
        })),
    }

    return result
  }
}
