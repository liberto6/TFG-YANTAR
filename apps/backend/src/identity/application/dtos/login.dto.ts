import { IsEmail, IsString, IsUUID } from 'class-validator'
import { UserDto } from './user.dto'

export class LoginRequest {
  @IsEmail()
  email!: string

  @IsString()
  password!: string

  @IsUUID()
  companyId!: string
}

export class LoginResponse {
  user!: UserDto
  token!: string
}
