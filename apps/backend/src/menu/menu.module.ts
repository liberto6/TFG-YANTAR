import { Module, forwardRef } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module'
import { MenuController } from './infrastructure/controllers/menu.controller'
import { AdminMenuController } from './infrastructure/controllers/admin-menu.controller'
import { ManageCategoriesService } from './application/services/manage-categories.service'
import { CreateDishService } from './application/services/create-dish.service'
import { UpdateDishService } from './application/services/update-dish.service'
import { ToggleDishAvailabilityService } from './application/services/toggle-dish-availability.service'
import { DeleteDishService } from './application/services/delete-dish.service'
import { ListDishesService } from './application/services/list-dishes.service'
import { GetMenuService } from './application/services/get-menu.service'
import { GetDishDetailService } from './application/services/get-dish-detail.service'
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma-category.repository'
import { PrismaDishRepository } from './infrastructure/repositories/prisma-dish.repository'
import { AdminGuard } from '../shared/infrastructure/guards/admin.guard'

@Module({
  imports: [forwardRef(() => IdentityModule)],
  controllers: [MenuController, AdminMenuController],
  providers: [
    ManageCategoriesService,
    CreateDishService,
    UpdateDishService,
    ToggleDishAvailabilityService,
    DeleteDishService,
    ListDishesService,
    GetMenuService,
    GetDishDetailService,
    {
      provide: 'ICategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    {
      provide: 'IDishRepository',
      useClass: PrismaDishRepository,
    },
    AdminGuard,
  ],
  exports: ['ICategoryRepository', 'IDishRepository'],
})
export class MenuModule {}
