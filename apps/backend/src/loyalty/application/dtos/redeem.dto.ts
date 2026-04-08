import { IsString, IsNotEmpty, IsUUID, IsNumber, IsPositive, IsOptional } from 'class-validator'

export class RedeemPointsRequest {
  @IsNumber()
  @IsPositive()
  points!: number

  @IsUUID('all')
  @IsOptional()
  rewardId?: string

  @IsString()
  @IsNotEmpty()
  reason!: string
}

export class AwardPointsRequest {
  @IsUUID('all')
  customerId!: string

  @IsUUID('all')
  companyId!: string

  @IsNumber()
  @IsPositive()
  orderTotal!: number

  @IsUUID('all')
  orderId!: string
}
