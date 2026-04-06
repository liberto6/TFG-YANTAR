import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  IsPositive,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DeliveryMode } from '@yantar/shared'

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  dishId!: string

  @IsNumber()
  @IsPositive()
  quantity!: number

  @IsOptional()
  @IsString()
  selectedVariantOptionId?: string | null

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedModifierOptionIds?: string[]

  @IsOptional()
  @IsString()
  notes?: string
}

export class CreateOrderRequest {
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @IsEnum(DeliveryMode)
  deliveryMode!: DeliveryMode

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[]

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  deliveryAddress?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number

  @IsOptional()
  @IsString()
  scheduledTime?: string

  @IsOptional()
  @IsString()
  paymentMethod?: string
}

export class AcceptOrderRequest {
  @IsNumber()
  @IsPositive()
  estimatedMinutes!: number
}

export class RejectOrderRequest {
  @IsString()
  @IsNotEmpty()
  reason!: string
}

export class CancelOrderRequest {
  @IsOptional()
  @IsString()
  reason?: string
}
