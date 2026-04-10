import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsInt,
  Min,
} from 'class-validator'
import { DeliveryZone } from '../../domain/entities/delivery-zone.entity'

export class CreateDeliveryZoneRequest {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsArray()
  @IsString({ each: true })
  postalCodes!: string[]

  @IsNumber()
  @Min(0)
  minOrderAmount!: number

  @IsNumber()
  @Min(0)
  deliveryFee!: number

  @IsInt()
  @Min(1)
  estimatedTimeMinutes!: number
}

export class UpdateDeliveryZoneRequest {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postalCodes?: string[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedTimeMinutes?: number
}

export class UpdateZonePolygonRequest {
  @IsOptional()
  polygon?: object | null
}

export class DeliveryZoneResponse {
  id!: string
  branchId!: string
  companyId!: string
  name!: string
  postalCodes!: string[]
  minOrderAmount!: number
  deliveryFee!: number
  estimatedTimeMinutes!: number
  isActive!: boolean
  polygon!: object | null

  static fromEntity(zone: DeliveryZone): DeliveryZoneResponse {
    const response = new DeliveryZoneResponse()
    response.id = zone.id
    response.branchId = zone.branchId
    response.companyId = zone.companyId
    response.name = zone.name
    response.postalCodes = zone.postalCodes
    response.minOrderAmount = zone.minOrderAmount
    response.deliveryFee = zone.deliveryFee
    response.estimatedTimeMinutes = zone.estimatedTimeMinutes
    response.isActive = zone.isActive
    response.polygon = zone.polygon
    return response
  }
}
