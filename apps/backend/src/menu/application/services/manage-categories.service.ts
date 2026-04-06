import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Category } from '../../domain/entities/category.entity'
import { ICategoryRepository } from '../../domain/ports/category-repository.port'
import { CategoryNotFoundError } from '../../domain/errors/category-not-found.error'
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryResponse,
} from '../dtos/category.dto'

@Injectable()
export class ManageCategoriesService {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async listCategories(companyId: string): Promise<CategoryResponse[]> {
    const categories = await this.categoryRepository.findByCompanyId(companyId)
    return categories.map(CategoryResponse.fromEntity)
  }

  async createCategory(
    companyId: string,
    request: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    const category = Category.create({
      id: randomUUID(),
      companyId,
      name: request.name,
      description: request.description,
      imageUrl: request.imageUrl,
      sortOrder: request.sortOrder,
    })

    const saved = await this.categoryRepository.save(category)
    return CategoryResponse.fromEntity(saved)
  }

  async updateCategory(
    companyId: string,
    categoryId: string,
    request: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findById(categoryId, companyId)
    if (!category) {
      throw new CategoryNotFoundError(categoryId)
    }

    let updated = category.update({
      name: request.name,
      description: request.description,
      imageUrl: request.imageUrl,
      sortOrder: request.sortOrder,
    })

    if (request.isActive === true) updated = updated.activate()
    if (request.isActive === false) updated = updated.deactivate()

    const saved = await this.categoryRepository.save(updated)
    return CategoryResponse.fromEntity(saved)
  }

  async deleteCategory(companyId: string, categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId, companyId)
    if (!category) {
      throw new CategoryNotFoundError(categoryId)
    }

    await this.categoryRepository.delete(categoryId, companyId)
  }
}
