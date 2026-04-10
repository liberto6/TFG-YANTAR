import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator'
import { Category } from '../../domain/entities/category.entity'

export class CreateCategoryRequest {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsString()
  imageUrl?: string | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class UpdateCategoryRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsString()
  imageUrl?: string | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class CategoryResponse {
  id!: string
  companyId!: string
  name!: string
  description!: string | null
  imageUrl!: string | null
  sortOrder!: number
  isActive!: boolean

  static fromEntity(category: Category): CategoryResponse {
    const dto = new CategoryResponse()
    dto.id = category.id
    dto.companyId = category.companyId
    dto.name = category.name
    dto.description = category.description
    dto.imageUrl = category.imageUrl
    dto.sortOrder = category.sortOrder
    dto.isActive = category.isActive
    return dto
  }
}
