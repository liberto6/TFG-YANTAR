import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Dish } from '../../domain/entities/dish.entity'
import { VariantGroup, VariantOption } from '../../domain/entities/variant-group.entity'
import {
  ModifierGroup,
  ModifierOption,
  SelectionType,
} from '../../domain/entities/modifier-group.entity'
import { IDishRepository } from '../../domain/ports/dish-repository.port'
import { ICategoryRepository } from '../../domain/ports/category-repository.port'
import { CategoryNotFoundError } from '../../domain/errors/category-not-found.error'
import { CreateDishRequest, DishResponse } from '../dtos/dish.dto'

@Injectable()
export class CreateDishService {
  constructor(
    @Inject('IDishRepository')
    private readonly dishRepository: IDishRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(companyId: string, request: CreateDishRequest): Promise<DishResponse> {
    const category = await this.categoryRepository.findById(
      request.categoryId,
      companyId,
    )
    if (!category) {
      throw new CategoryNotFoundError(request.categoryId)
    }

    const dishId = randomUUID()

    const variantGroups = (request.variantGroups ?? []).map((vg) => {
      const groupId = vg.id ?? randomUUID()
      return new VariantGroup({
        id: groupId,
        dishId,
        name: vg.name,
        required: true,
        sortOrder: vg.sortOrder ?? 0,
        options: vg.options.map(
          (o, i) =>
            new VariantOption({
              id: o.id ?? randomUUID(),
              variantGroupId: groupId,
              name: o.name,
              priceAdjustment: o.priceAdjustment,
              sortOrder: o.sortOrder ?? i,
            }),
        ),
      })
    })

    const modifierGroups = (request.modifierGroups ?? []).map((mg) => {
      const groupId = mg.id ?? randomUUID()
      return new ModifierGroup({
        id: groupId,
        dishId,
        name: mg.name,
        required: mg.required ?? false,
        selectionType: (mg.selectionType as SelectionType) ?? SelectionType.MULTIPLE,
        minSelections: mg.minSelections ?? 0,
        maxSelections: mg.maxSelections ?? null,
        sortOrder: mg.sortOrder ?? 0,
        options: mg.options.map(
          (o, i) =>
            new ModifierOption({
              id: o.id ?? randomUUID(),
              modifierGroupId: groupId,
              name: o.name,
              extraPrice: o.extraPrice,
              sortOrder: o.sortOrder ?? i,
            }),
        ),
      })
    })

    const dish = Dish.create({
      id: dishId,
      companyId,
      categoryId: request.categoryId,
      name: request.name,
      description: request.description,
      basePrice: request.basePrice,
      imageUrl: request.imageUrl,
      sortOrder: request.sortOrder,
      allergenCodes: request.allergenCodes ?? [],
      variantGroups,
      modifierGroups,
    })

    const saved = await this.dishRepository.save(dish)
    return DishResponse.fromEntity(saved)
  }
}
