import { UserRole } from '@yantar/shared'

export class UserDto {
  id!: string
  email!: string
  name!: string
  role!: UserRole
  companyId!: string | null

  static fromEntity(entity: {
    id: string
    email: string
    name: string
    role: UserRole
    companyId: string | null
  }): UserDto {
    const dto = new UserDto()
    dto.id = entity.id
    dto.email = entity.email
    dto.name = entity.name
    dto.role = entity.role
    dto.companyId = entity.companyId
    return dto
  }
}
