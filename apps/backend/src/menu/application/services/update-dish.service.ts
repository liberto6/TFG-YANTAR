import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { VariantGroup, VariantOption } from '../../domain/entities/variant-group.entity'
import {
  ModifierGroup,
  ModifierOption,
  SelectionType,
} from '../../domain/entities/modifier-group.entity'
import { IDishRepository } from '../../domain/ports/dish-repository.port'
import { ICategoryRepository } from '../../domain/ports/category-repository.port'
import { DishNotFoundError } from '../../domain/errors/dish-not-found.error'
import { CategoryNotFoundError } from '../../domain/errors/category-not-found.error'
import { UpdateDishRequest, DishResponse } from '../dtos/dish.dto'

@Injectable()
export class UpdateDishService {
  constructor(
    @Inject('IDishRepository')
    private readonly dishRepository: IDishRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    companyId: string,
    dishId: string,
    request: UpdateDishRequest,
  ): Promise<DishResponse> {
    const dish = await this.dishRepository.findById(dishId, companyId)
    if (!dish) {
      throw new DishNotFoundError(dishId)
    }

    if (request.categoryId && request.categoryId !== dish.categoryId) {
      const category = await this.categoryRepository.findById(
        request.categoryId,
        companyId,
      )
      if (!category) {
        throw new CategoryNotFoundError(request.categoryId)
      }
    }

    let variantGroups: VariantGroup[] | undefined
    if (request.variantGroups !== undefined) {
      variantGroups = request.variantGroups.map((vg) => {
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
    }

    let modifierGroups: ModifierGroup[] | undefined
    if (request.modifierGroups !== undefined) {
      modifierGroups = request.modifierGroups.map((mg) => {
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
    }

    const updated = dish.updateInfo({
      name: request.name,
      description: request.description,
      basePrice: request.basePrice,
      imageUrl: request.imageUrl,
      categoryId: request.categoryId,
      sortOrder: request.sortOrder,
      allergenCodes: request.allergenCodes,
      variantGroups,
      modifierGroups,
    })

    const saved = await this.dishRepository.save(updated)
    return DishResponse.fromEntity(saved)
  }
}
