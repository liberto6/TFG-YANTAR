import { Inject, Injectable } from '@nestjs/common'
import { IDishRepository } from '../../../menu/domain/ports/dish-repository.port'
import { IDishCheckerPort, DishInfo } from '../../domain/ports/dish-checker.port'
import { DishStatus } from '@yantar/shared'

@Injectable()
export class MenuDishCheckerAdapter implements IDishCheckerPort {
  constructor(
    @Inject('IDishRepository')
    private readonly dishRepository: IDishRepository,
  ) {}

  async getActiveDishInfo(dishId: string, companyId: string): Promise<DishInfo | null> {
    const dish = await this.dishRepository.findById(dishId, companyId)
    if (!dish || dish.status !== DishStatus.ACTIVE) return null

    return {
      name: dish.name,
      basePrice: dish.basePrice,
      variantGroups: dish.variantGroups.map((vg) => ({
        id: vg.id,
        options: vg.options.map((o) => ({
          id: o.id,
          name: o.name,
          priceAdjustment: o.priceAdjustment,
        })),
      })),
      modifierGroups: dish.modifierGroups.map((mg) => ({
        id: mg.id,
        options: mg.options.map((o) => ({
          id: o.id,
          name: o.name,
          extraPrice: o.extraPrice,
        })),
      })),
    }
  }
}
