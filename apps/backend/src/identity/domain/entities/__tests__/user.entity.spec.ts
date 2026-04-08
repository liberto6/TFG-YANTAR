import { UserRole } from '@yantar/shared'
import { User } from '../user.entity'

describe('User Entity', () => {
  const baseProps = {
    id: 'user-1',
    email: 'alice@example.com',
    displayName: 'Alice',
    companyId: 'company-1',
  }

  describe('createCustomer', () => {
    it('should create a user with role CUSTOMER', () => {
      const user = User.createCustomer(baseProps)

      expect(user.id).toBe('user-1')
      expect(user.email).toBe('alice@example.com')
      expect(user.displayName).toBe('Alice')
      expect(user.role).toBe(UserRole.CUSTOMER)
      expect(user.companyId).toBe('company-1')
      expect(user.phone).toBeNull()
      expect(user.avatarUrl).toBeNull()
      expect(user.preferences).toEqual({})
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should accept optional phone', () => {
      const user = User.createCustomer({ ...baseProps, phone: '+34600000000' })
      expect(user.phone).toBe('+34600000000')
    })
  })

  describe('createAdmin', () => {
    it('should create a user with role RESTAURANT_ADMIN', () => {
      const user = User.createAdmin(baseProps)

      expect(user.role).toBe(UserRole.RESTAURANT_ADMIN)
      expect(user.email).toBe('alice@example.com')
      expect(user.companyId).toBe('company-1')
    })
  })

  describe('role checks', () => {
    it('isCustomer returns true for CUSTOMER role', () => {
      const user = User.createCustomer(baseProps)
      expect(user.isCustomer()).toBe(true)
      expect(user.isAdmin()).toBe(false)
      expect(user.isSuperadmin()).toBe(false)
    })

    it('isAdmin returns true for RESTAURANT_ADMIN role', () => {
      const user = User.createAdmin(baseProps)
      expect(user.isAdmin()).toBe(true)
      expect(user.isCustomer()).toBe(false)
      expect(user.isSuperadmin()).toBe(false)
    })

    it('isSuperadmin returns true for SUPERADMIN role', () => {
      const user = User.restore({
        ...baseProps,
        phone: null,
        avatarUrl: null,
        role: UserRole.SUPERADMIN,
        preferences: {},
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(user.isSuperadmin()).toBe(true)
      expect(user.isAdmin()).toBe(false)
      expect(user.isCustomer()).toBe(false)
    })
  })

  describe('canManageCompany', () => {
    it('admin of same company can manage it', () => {
      const admin = User.createAdmin(baseProps)
      expect(admin.canManageCompany('company-1')).toBe(true)
    })

    it('admin of different company cannot manage it', () => {
      const admin = User.createAdmin(baseProps)
      expect(admin.canManageCompany('company-other')).toBe(false)
    })

    it('superadmin can manage any company', () => {
      const superadmin = User.restore({
        ...baseProps,
        phone: null,
        avatarUrl: null,
        role: UserRole.SUPERADMIN,
        preferences: {},
        passwordHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      expect(superadmin.canManageCompany('company-1')).toBe(true)
      expect(superadmin.canManageCompany('company-xyz')).toBe(true)
    })

    it('customer cannot manage any company', () => {
      const customer = User.createCustomer(baseProps)
      expect(customer.canManageCompany('company-1')).toBe(false)
    })
  })

  describe('belongsToCompany', () => {
    it('returns true when user belongs to the given company', () => {
      const user = User.createCustomer(baseProps)
      expect(user.belongsToCompany('company-1')).toBe(true)
    })

    it('returns false when user does not belong to the given company', () => {
      const user = User.createCustomer(baseProps)
      expect(user.belongsToCompany('company-other')).toBe(false)
    })
  })

  describe('updateProfile', () => {
    it('returns a new instance with updated fields', () => {
      const original = User.createCustomer(baseProps)
      const updated = original.updateProfile({
        displayName: 'Alice Updated',
        phone: '+34611111111',
        avatarUrl: 'https://example.com/avatar.png',
        preferences: { theme: 'dark' },
      })

      expect(updated).not.toBe(original)
      expect(updated.displayName).toBe('Alice Updated')
      expect(updated.phone).toBe('+34611111111')
      expect(updated.avatarUrl).toBe('https://example.com/avatar.png')
      expect(updated.preferences).toEqual({ theme: 'dark' })
    })

    it('preserves original instance unchanged', () => {
      const original = User.createCustomer(baseProps)
      original.updateProfile({ displayName: 'Changed' })

      expect(original.displayName).toBe('Alice')
    })

    it('keeps unchanged fields when partially updating', () => {
      const original = User.createCustomer({
        ...baseProps,
        phone: '+34600000000',
      })
      const updated = original.updateProfile({ displayName: 'Bob' })

      expect(updated.displayName).toBe('Bob')
      expect(updated.phone).toBe('+34600000000')
      expect(updated.email).toBe(original.email)
      expect(updated.role).toBe(original.role)
    })

    it('preserves immutable fields like id, email, role, companyId', () => {
      const original = User.createCustomer(baseProps)
      const updated = original.updateProfile({ displayName: 'New Name' })

      expect(updated.id).toBe(original.id)
      expect(updated.email).toBe(original.email)
      expect(updated.role).toBe(original.role)
      expect(updated.companyId).toBe(original.companyId)
      expect(updated.createdAt).toEqual(original.createdAt)
    })
  })

  describe('restore', () => {
    it('reconstitutes all fields from stored data', () => {
      const createdAt = new Date('2025-01-01')
      const updatedAt = new Date('2025-06-15')

      const user = User.restore({
        id: 'user-42',
        email: 'bob@example.com',
        displayName: 'Bob',
        phone: '+34699999999',
        avatarUrl: 'https://example.com/bob.png',
        companyId: 'company-5',
        role: UserRole.RESTAURANT_ADMIN,
        preferences: { lang: 'es' },
        passwordHash: '$2b$10$abc',
        createdAt,
        updatedAt,
      })

      expect(user.id).toBe('user-42')
      expect(user.email).toBe('bob@example.com')
      expect(user.displayName).toBe('Bob')
      expect(user.phone).toBe('+34699999999')
      expect(user.avatarUrl).toBe('https://example.com/bob.png')
      expect(user.companyId).toBe('company-5')
      expect(user.role).toBe(UserRole.RESTAURANT_ADMIN)
      expect(user.preferences).toEqual({ lang: 'es' })
      expect(user.passwordHash).toBe('$2b$10$abc')
      expect(user.createdAt).toBe(createdAt)
      expect(user.updatedAt).toBe(updatedAt)
    })
  })

  describe('passwordHash', () => {
    it('es null por defecto al crear customer', () => {
      const user = User.createCustomer(baseProps)
      expect(user.passwordHash).toBeNull()
    })

    it('es null por defecto al crear admin', () => {
      const user = User.createAdmin(baseProps)
      expect(user.passwordHash).toBeNull()
    })

    it('se almacena si se pasa en createCustomer', () => {
      const user = User.createCustomer({ ...baseProps, passwordHash: '$2b$10$hash' })
      expect(user.passwordHash).toBe('$2b$10$hash')
    })

    it('se preserva al llamar updateProfile', () => {
      const user = User.createCustomer({ ...baseProps, passwordHash: '$2b$10$hash' })
      const updated = user.updateProfile({ displayName: 'New Name' })
      expect(updated.passwordHash).toBe('$2b$10$hash')
    })
  })
})
