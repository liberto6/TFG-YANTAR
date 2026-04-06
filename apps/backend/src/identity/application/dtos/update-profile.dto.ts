import { IsOptional, IsString } from 'class-validator'

export class UpdateProfileRequest {
  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  avatarUrl?: string

  @IsOptional()
  preferences?: Record<string, unknown>
}
