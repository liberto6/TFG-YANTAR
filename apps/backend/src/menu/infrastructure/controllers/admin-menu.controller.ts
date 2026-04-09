import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { Request } from 'express'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'
import { AdminGuard } from '../../../shared/infrastructure/guards/admin.guard'
import { GetCurrentUserService } from '../../../identity/application/services/get-current-user.service'
import { ManageCategoriesService } from '../../application/services/manage-categories.service'
import { CreateDishService } from '../../application/services/create-dish.service'
import { UpdateDishService } from '../../application/services/update-dish.service'
import { ToggleDishAvailabilityService } from '../../application/services/toggle-dish-availability.service'
import { DeleteDishService } from '../../application/services/delete-dish.service'
import { ListDishesService } from '../../application/services/list-dishes.service'
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
} from '../../application/dtos/category.dto'
import {
  CreateDishRequest,
  UpdateDishRequest,
  DishResponse,
} from '../../application/dtos/dish.dto'

@Controller('admin/menu')
@UseGuards(AuthGuard, AdminGuard)
export class AdminMenuController {
  constructor(
    private readonly getCurrentUserService: GetCurrentUserService,
    private readonly manageCategoriesService: ManageCategoriesService,
    private readonly listDishesService: ListDishesService,
    private readonly createDishService: CreateDishService,
    private readonly updateDishService: UpdateDishService,
    private readonly toggleDishAvailabilityService: ToggleDishAvailabilityService,
    private readonly deleteDishService: DeleteDishService,
  ) {}

  private async getCompanyId(req: Request): Promise<string> {
    const userId = (req as any).userId as string
    const user = await this.getCurrentUserService.execute(userId)
    return user.companyId!
  }

  // ─── Image upload ─────────────────────────────────────────────────────────

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadPath = join(process.cwd(), 'public', 'uploads')
          if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true })
          cb(null, uploadPath)
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
          cb(null, `${unique}${extname(file.originalname)}`)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        const allowed = /image\/(jpeg|jpg|png|webp|gif)/
        cb(null, allowed.test(file.mimetype))
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<{ url: string }> {
    const host = `${req.protocol}://${req.get('host')}`
    return { url: `${host}/uploads/${file.filename}` }
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  @Get('categories')
  async listCategories(@Req() req: Request): Promise<CategoryResponse[]> {
    const companyId = await this.getCompanyId(req)
    return this.manageCategoriesService.listCategories(companyId)
  }

  @Post('categories')
  async createCategory(
    @Req() req: Request,
    @Body() body: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    const companyId = await this.getCompanyId(req)
    return this.manageCategoriesService.createCategory(companyId, body)
  }

  @Patch('categories/:categoryId')
  async updateCategory(
    @Req() req: Request,
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    const companyId = await this.getCompanyId(req)
    return this.manageCategoriesService.updateCategory(companyId, categoryId, body)
  }

  @Delete('categories/:categoryId')
  async deleteCategory(
    @Req() req: Request,
    @Param('categoryId') categoryId: string,
  ): Promise<void> {
    const companyId = await this.getCompanyId(req)
    return this.manageCategoriesService.deleteCategory(companyId, categoryId)
  }

  // ─── Dishes ───────────────────────────────────────────────────────────────

  @Get('dishes')
  async listDishes(
    @Req() req: Request,
    @Query('categoryId') categoryId?: string,
  ): Promise<DishResponse[]> {
    const companyId = await this.getCompanyId(req)
    return this.listDishesService.execute(companyId, categoryId)
  }

  @Post('dishes')
  async createDish(
    @Req() req: Request,
    @Body() body: CreateDishRequest,
  ): Promise<DishResponse> {
    const companyId = await this.getCompanyId(req)
    return this.createDishService.execute(companyId, body)
  }

  @Put('dishes/:dishId')
  async updateDish(
    @Req() req: Request,
    @Param('dishId') dishId: string,
    @Body() body: UpdateDishRequest,
  ): Promise<DishResponse> {
    const companyId = await this.getCompanyId(req)
    return this.updateDishService.execute(companyId, dishId, body)
  }

  @Patch('dishes/:dishId/toggle')
  async toggleDishAvailability(
    @Req() req: Request,
    @Param('dishId') dishId: string,
  ): Promise<DishResponse> {
    const companyId = await this.getCompanyId(req)
    return this.toggleDishAvailabilityService.execute(companyId, dishId)
  }

  @Delete('dishes/:dishId')
  async deleteDish(
    @Req() req: Request,
    @Param('dishId') dishId: string,
  ): Promise<void> {
    const companyId = await this.getCompanyId(req)
    return this.deleteDishService.execute(companyId, dishId)
  }
}
