import { UserRole } from '../value-objects/user-role.enum'

export class User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly role: UserRole
  readonly companyId: string | null
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(props: {
    id: string
    email: string
    name: string
    role: UserRole
    companyId: string | null
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.email = props.email
    this.name = props.name
    this.role = props.role
    this.companyId = props.companyId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  isCustomer(): boolean {
    return this.role === UserRole.CUSTOMER
  }

  isAdmin(): boolean {
    return this.role === UserRole.RESTAURANT_ADMIN
  }

  isSuperadmin(): boolean {
    return this.role === UserRole.SUPERADMIN
  }

  canManageCompany(companyId: string): boolean {
    if (this.isSuperadmin()) return true
    if (this.isAdmin() && this.companyId === companyId) return true
    return false
  }

  belongsToCompany(companyId: string): boolean {
    return this.companyId === companyId
  }
}
