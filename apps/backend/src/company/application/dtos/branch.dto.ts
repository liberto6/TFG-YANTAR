import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator'
import { ServiceMode } from '@yantar/shared'
import { Branch } from '../../domain/entities/branch.entity'

export class CreateBranchRequest {
  @IsString()
  @IsNotEmpty()
  name!: string

  @IsString()
  @IsNotEmpty()
  address!: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsNumber()
  latitude?: number

  @IsOptional()
  @IsNumber()
  longitude?: number

  @IsArray()
  @IsEnum(ServiceMode, { each: true })
  serviceModes!: ServiceMode[]
}

export class UpdateBranchRequest {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  phone?: string | null

  @IsOptional()
  @IsString()
  email?: string | null

  @IsOptional()
  @IsNumber()
  latitude?: number | null

  @IsOptional()
  @IsNumber()
  longitude?: number | null

  @IsOptional()
  @IsArray()
  @IsEnum(ServiceMode, { each: true })
  serviceModes?: ServiceMode[]
}

export class BranchResponse {
  id!: string
  companyId!: string
  name!: string
  address!: string
  phone!: string | null
  email!: string | null
  latitude!: number | null
  longitude!: number | null
  serviceModes!: ServiceMode[]
  isActive!: boolean
  createdAt!: Date
  updatedAt!: Date

  static fromEntity(branch: Branch): BranchResponse {
    const response = new BranchResponse()
    response.id = branch.id
    response.companyId = branch.companyId
    response.name = branch.name
    response.address = branch.address
    response.phone = branch.phone
    response.email = branch.email
    response.latitude = branch.latitude
    response.longitude = branch.longitude
    response.serviceModes = branch.serviceModes
    response.isActive = branch.isActive
    response.createdAt = branch.createdAt
    response.updatedAt = branch.updatedAt
    return response
  }
}
