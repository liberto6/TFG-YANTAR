import { UserRole } from '@yantar/shared'
import { User } from '../../domain/entities/user.entity'

export class UserDto {
  id!: string
  email!: string
  displayName!: string
  phone!: string | null
  avatarUrl!: string | null
  role!: UserRole
  companyId!: string | null

  static fromEntity(user: User): UserDto {
    const dto = new UserDto()
    dto.id = user.id
    dto.email = user.email
    dto.displayName = user.displayName
    dto.phone = user.phone
    dto.avatarUrl = user.avatarUrl
    dto.role = user.role
    dto.companyId = user.companyId
    return dto
  }
}
