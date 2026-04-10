import { RewardType } from '@yantar/shared'
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator'
import { Reward } from '../../domain/entities/reward.entity'

export class RewardDto {
  id!: string
  companyId!: string
  name!: string
  description!: string | null
  type!: RewardType
  pointsCost!: number
  value!: string
  isActive!: boolean
  stock!: number | null
  validFrom!: Date | null
  validUntil!: Date | null
  isAvailable!: boolean

  static fromEntity(reward: Reward): RewardDto {
    const dto = new RewardDto()
    dto.id = reward.id
    dto.companyId = reward.companyId
    dto.name = reward.name
    dto.description = reward.description
    dto.type = reward.type
    dto.pointsCost = reward.pointsCost
    dto.value = reward.value
    dto.isActive = reward.isActive
    dto.stock = reward.stock
    dto.validFrom = reward.validFrom
    dto.validUntil = reward.validUntil
    dto.isAvailable = reward.isAvailable()
    return dto
  }
}

export class CreateRewardRequest {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsEnum(RewardType)
  type!: RewardType

  @IsNumber()
  @IsPositive()
  pointsCost!: number

  @IsString()
  @IsNotEmpty()
  value!: string

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number | null

  @IsDateString()
  @IsOptional()
  validFrom?: string | null

  @IsDateString()
  @IsOptional()
  validUntil?: string | null
}

export class UpdateRewardRequest {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsPositive()
  @IsOptional()
  pointsCost?: number

  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number | null
}
