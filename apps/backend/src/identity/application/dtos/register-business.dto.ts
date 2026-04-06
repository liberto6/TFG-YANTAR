import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator'
import { UserDto } from './user.dto'

export class RegisterBusinessRequest {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string

  @IsString()
  @IsNotEmpty()
  displayName!: string

  @IsString()
  @IsNotEmpty()
  companyName!: string

  @IsOptional()
  @IsString()
  phone?: string
}

export class RegisterBusinessResponse {
  user!: UserDto
  company!: { id: string; name: string; slug: string }
}
