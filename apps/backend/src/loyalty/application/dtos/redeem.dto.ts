import { IsString, IsNotEmpty, IsUUID, IsNumber, IsPositive } from 'class-validator'

export class RedeemPointsRequest {
  @IsNumber()
  @IsPositive()
  points!: number

  @IsUUID()
  @IsOptional()
  rewardId?: string

  @IsString()
  @IsNotEmpty()
  reason!: string
}

export class AwardPointsRequest {
  @IsUUID()
  customerId!: string

  @IsUUID()
  companyId!: string

  @IsNumber()
  @IsPositive()
  orderTotal!: number

  @IsUUID()
  orderId!: string
}

// Need this import for IsOptional
import { IsOptional } from 'class-validator'
