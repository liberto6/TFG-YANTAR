import { Controller, Get, Param, Query } from '@nestjs/common'
import { GetMenuService, MenuResponse } from '../../application/services/get-menu.service'
import { GetDishDetailService } from '../../application/services/get-dish-detail.service'
import { DishResponse } from '../../application/dtos/dish.dto'

@Controller('menu')
export class MenuController {
  constructor(
    private readonly getMenuService: GetMenuService,
    private readonly getDishDetailService: GetDishDetailService,
  ) {}

  @Get(':companyId')
  async getMenu(
    @Param('companyId') companyId: string,
    @Query('exclude') exclude?: string,
  ): Promise<MenuResponse> {
    const excludeAllergenCodes = exclude ? exclude.split(',').map((c) => c.trim()) : []
    return this.getMenuService.execute(companyId, excludeAllergenCodes)
  }

  @Get(':companyId/dishes/:dishId')
  async getDishDetail(
    @Param('companyId') companyId: string,
    @Param('dishId') dishId: string,
  ): Promise<DishResponse> {
    return this.getDishDetailService.execute(companyId, dishId)
  }
}
