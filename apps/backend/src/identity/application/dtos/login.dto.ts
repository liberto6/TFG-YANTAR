import { IsEmail, IsString } from 'class-validator'
import { UserDto } from './user.dto'

export class LoginRequest {
  @IsEmail()
  email!: string

  @IsString()
  password!: string

  @IsString()
  companyId!: string
}

export class LoginResponse {
  user!: UserDto
  token!: string
}
