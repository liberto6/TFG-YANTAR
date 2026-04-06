import { UserRole } from '@yantar/shared'
import { PrismaUserRepository } from '../prisma-user.repository'
import { User } from '../../../domain/entities/user.entity'

const mockPrismaUser = {
  id: 'user-1',
  email: 'alice@example.com',
  displayName: 'Alice',
  phone: '+34600000000',
  avatarUrl: null,
  companyId: 'company-1',
  role: 'CUSTOMER' as const,
  preferences: {},
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-06-15'),
}

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
}

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new PrismaUserRepository(mockPrisma as any)
  })

  describe('findById', () => {
    it('should return a domain User when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser)

      const result = await repository.findById('user-1')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      })
      expect(result).not.toBeNull()
      expect(result!.id).toBe('user-1')
      expect(result!.email).toBe('alice@example.com')
      expect(result!.displayName).toBe('Alice')
      expect(result!.role).toBe(UserRole.CUSTOMER)
    })

    it('should return null when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('save', () => {
    it('should upsert the user and return domain entity', async () => {
      const user = User.createCustomer({
        id: 'user-1',
        email: 'alice@example.com',
        displayName: 'Alice',
        phone: '+34600000000',
        companyId: 'company-1',
      })

      mockPrisma.user.upsert.mockResolvedValue(mockPrismaUser)

      const result = await repository.save(user)

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          create: expect.objectContaining({
            id: 'user-1',
            email: 'alice@example.com',
            displayName: 'Alice',
            role: UserRole.CUSTOMER,
          }),
          update: expect.objectContaining({
            id: 'user-1',
            email: 'alice@example.com',
          }),
        }),
      )
      expect(result.id).toBe('user-1')
      expect(result.role).toBe(UserRole.CUSTOMER)
    })
  })

  describe('findByEmailAndCompany', () => {
    it('should use the composite unique key where clause', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockPrismaUser)

      const result = await repository.findByEmailAndCompany(
        'alice@example.com',
        'company-1',
      )

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email_companyId: {
            email: 'alice@example.com',
            companyId: 'company-1',
          },
        },
      })
      expect(result).not.toBeNull()
      expect(result!.email).toBe('alice@example.com')
    })

    it('should return null when not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await repository.findByEmailAndCompany(
        'nobody@example.com',
        'company-1',
      )

      expect(result).toBeNull()
    })
  })
})
