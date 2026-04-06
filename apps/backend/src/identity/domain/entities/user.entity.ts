import { UserRole } from '@yantar/shared'

interface UserProps {
  id: string
  email: string
  displayName: string
  phone: string | null
  avatarUrl: string | null
  companyId: string | null
  role: UserRole
  preferences: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export class User {
  readonly id: string
  readonly email: string
  readonly displayName: string
  readonly phone: string | null
  readonly avatarUrl: string | null
  readonly companyId: string | null
  readonly role: UserRole
  readonly preferences: Record<string, unknown>
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.email = props.email
    this.displayName = props.displayName
    this.phone = props.phone
    this.avatarUrl = props.avatarUrl
    this.companyId = props.companyId
    this.role = props.role
    this.preferences = props.preferences
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static createCustomer(props: {
    id: string
    email: string
    displayName: string
    phone?: string
    companyId: string
  }): User {
    const now = new Date()
    return new User({
      id: props.id,
      email: props.email,
      displayName: props.displayName,
      phone: props.phone ?? null,
      avatarUrl: null,
      companyId: props.companyId,
      role: UserRole.CUSTOMER,
      preferences: {},
      createdAt: now,
      updatedAt: now,
    })
  }

  static createAdmin(props: {
    id: string
    email: string
    displayName: string
    phone?: string
    companyId: string
  }): User {
    const now = new Date()
    return new User({
      id: props.id,
      email: props.email,
      displayName: props.displayName,
      phone: props.phone ?? null,
      avatarUrl: null,
      companyId: props.companyId,
      role: UserRole.RESTAURANT_ADMIN,
      preferences: {},
      createdAt: now,
      updatedAt: now,
    })
  }

  static restore(props: UserProps): User {
    return new User(props)
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

  updateProfile(changes: {
    displayName?: string
    phone?: string | null
    avatarUrl?: string | null
    preferences?: Record<string, unknown>
  }): User {
    return new User({
      id: this.id,
      email: this.email,
      displayName: changes.displayName ?? this.displayName,
      phone: changes.phone !== undefined ? changes.phone : this.phone,
      avatarUrl: changes.avatarUrl !== undefined ? changes.avatarUrl : this.avatarUrl,
      companyId: this.companyId,
      role: this.role,
      preferences: changes.preferences ?? this.preferences,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }
}
