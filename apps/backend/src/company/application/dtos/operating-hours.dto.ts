import {
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator'
import { Type } from 'class-transformer'
import { OperatingHour } from '../../domain/value-objects/operating-hour.vo'

export class OperatingHourItem {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number

  @IsString()
  openTime!: string

  @IsString()
  closeTime!: string

  @IsBoolean()
  isClosed!: boolean
}

export class SetOperatingHoursRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingHourItem)
  hours!: OperatingHourItem[]
}

export class OperatingHourResponse {
  id!: string
  dayOfWeek!: number
  openTime!: string
  closeTime!: string
  isClosed!: boolean

  static fromEntity(hour: OperatingHour): OperatingHourResponse {
    const response = new OperatingHourResponse()
    response.id = hour.id
    response.dayOfWeek = hour.dayOfWeek
    response.openTime = hour.openTime
    response.closeTime = hour.closeTime
    response.isClosed = hour.isClosed
    return response
  }
}
