import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DishStatus } from '@yantar/shared'
import { SelectionType } from '../../domain/entities/modifier-group.entity'
import { Dish } from '../../domain/entities/dish.entity'
import { VariantGroup } from '../../domain/entities/variant-group.entity'
import { ModifierGroup } from '../../domain/entities/modifier-group.entity'

// ─── Variant DTOs ────────────────────────────────────────────────────────────

export class VariantOptionRequest {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsNumber()
  priceAdjustment!: number

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class VariantGroupRequest {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantOptionRequest)
  options!: VariantOptionRequest[]
}

// ─── Modifier DTOs ───────────────────────────────────────────────────────────

export class ModifierOptionRequest {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsNumber()
  @Min(0)
  extraPrice!: number

  @IsOptional()
  @IsNumber()
  sortOrder?: number
}

export class ModifierGroupRequest {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsBoolean()
  required?: boolean

  @IsOptional()
  @IsString()
  selectionType?: SelectionType

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSelections?: number

  @IsOptional()
  @IsNumber()
  maxSelections?: number | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionRequest)
  options!: ModifierOptionRequest[]
}

// ─── Dish Request DTOs ───────────────────────────────────────────────────────

export class CreateDishRequest {
  @IsString()
  @IsNotEmpty()
  categoryId!: string

  @IsString()
  @IsNotEmpty()
  name!: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsNumber()
  @Min(0)
  basePrice!: number

  @IsOptional()
  @IsString()
  imageUrl?: string | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergenCodes?: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantGroupRequest)
  variantGroups?: VariantGroupRequest[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierGroupRequest)
  modifierGroups?: ModifierGroupRequest[]
}

export class UpdateDishRequest {
  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string

  @IsOptional()
  @IsString()
  description?: string | null

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number

  @IsOptional()
  @IsString()
  imageUrl?: string | null

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergenCodes?: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantGroupRequest)
  variantGroups?: VariantGroupRequest[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierGroupRequest)
  modifierGroups?: ModifierGroupRequest[]
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class VariantOptionResponse {
  id!: string
  name!: string
  priceAdjustment!: number
  sortOrder!: number
}

export class VariantGroupResponse {
  id!: string
  name!: string
  required!: boolean
  sortOrder!: number
  options!: VariantOptionResponse[]

  static fromEntity(group: VariantGroup): VariantGroupResponse {
    const dto = new VariantGroupResponse()
    dto.id = group.id
    dto.name = group.name
    dto.required = group.required
    dto.sortOrder = group.sortOrder
    dto.options = group.options.map((o) => ({
      id: o.id,
      name: o.name,
      priceAdjustment: o.priceAdjustment,
      sortOrder: o.sortOrder,
    }))
    return dto
  }
}

export class ModifierOptionResponse {
  id!: string
  name!: string
  extraPrice!: number
  sortOrder!: number
}

export class ModifierGroupResponse {
  id!: string
  name!: string
  required!: boolean
  selectionType!: SelectionType
  minSelections!: number
  maxSelections!: number | null
  sortOrder!: number
  options!: ModifierOptionResponse[]

  static fromEntity(group: ModifierGroup): ModifierGroupResponse {
    const dto = new ModifierGroupResponse()
    dto.id = group.id
    dto.name = group.name
    dto.required = group.required
    dto.selectionType = group.selectionType
    dto.minSelections = group.minSelections
    dto.maxSelections = group.maxSelections
    dto.sortOrder = group.sortOrder
    dto.options = group.options.map((o) => ({
      id: o.id,
      name: o.name,
      extraPrice: o.extraPrice,
      sortOrder: o.sortOrder,
    }))
    return dto
  }
}

export class DishResponse {
  id!: string
  companyId!: string
  categoryId!: string
  name!: string
  description!: string | null
  basePrice!: number
  imageUrl!: string | null
  status!: DishStatus
  sortOrder!: number
  allergenCodes!: string[]
  variantGroups!: VariantGroupResponse[]
  modifierGroups!: ModifierGroupResponse[]

  static fromEntity(dish: Dish): DishResponse {
    const dto = new DishResponse()
    dto.id = dish.id
    dto.companyId = dish.companyId
    dto.categoryId = dish.categoryId
    dto.name = dish.name
    dto.description = dish.description
    dto.basePrice = dish.basePrice
    dto.imageUrl = dish.imageUrl
    dto.status = dish.status
    dto.sortOrder = dish.sortOrder
    dto.allergenCodes = dish.allergenCodes
    dto.variantGroups = dish.variantGroups.map(VariantGroupResponse.fromEntity)
    dto.modifierGroups = dish.modifierGroups.map(ModifierGroupResponse.fromEntity)
    return dto
  }
}
