import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { User } from '../../domain/entities/user.entity'
import { UserDto } from './user.dto'

export class RegisterUserRequest {
  @IsEmail()
  email!: string

  @IsString()
  @MinLength(8)
  password!: string

  @IsString()
  @IsNotEmpty()
  displayName!: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsUUID()
  companyId!: string
}

export class RegisterUserResponse {
  user!: UserDto

  static fromEntity(user: User): RegisterUserResponse {
    const response = new RegisterUserResponse()
    response.user = UserDto.fromEntity(user)
    return response
  }
}
