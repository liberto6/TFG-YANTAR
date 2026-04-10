import { Dish } from '../entities/dish.entity'
import { DishStatus } from '@yantar/shared'

export interface IDishRepository {
  findByCompanyId(
    companyId: string,
    filters?: { categoryId?: string; status?: DishStatus },
  ): Promise<Dish[]>
  findById(dishId: string, companyId: string): Promise<Dish | null>
  findByIds(dishIds: string[], companyId: string): Promise<Dish[]>
  save(dish: Dish): Promise<Dish>
  delete(dishId: string, companyId: string): Promise<void>
}
