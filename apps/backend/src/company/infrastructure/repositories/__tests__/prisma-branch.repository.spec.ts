import { ServiceMode } from '@yantar/shared'
import { PrismaBranchRepository } from '../prisma-branch.repository'
import { Branch } from '../../../domain/entities/branch.entity'

const mockPrismaBranch = {
  id: 'branch-1',
  companyId: 'company-1',
  name: 'Downtown Branch',
  address: '123 Main St',
  phone: '+34600000000',
  email: 'downtown@example.com',
  latitude: 40.4168,
  longitude: -3.7038,
  serviceModes: ['PICKUP', 'DELIVERY'],
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-06-15'),
  operatingHours: [],
}

const mockPrisma = {
  branch: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
}

describe('PrismaBranchRepository', () => {
  let repository: PrismaBranchRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new PrismaBranchRepository(mockPrisma as any)
  })

  describe('findById', () => {
    it('should find branch scoped by companyId', async () => {
      mockPrisma.branch.findFirst.mockResolvedValue(mockPrismaBranch)

      const result = await repository.findById('branch-1', 'company-1')

      expect(mockPrisma.branch.findFirst).toHaveBeenCalledWith({
        where: { id: 'branch-1', companyId: 'company-1' },
        include: { operatingHours: true },
      })
      expect(result).not.toBeNull()
      expect(result!.id).toBe('branch-1')
      expect(result!.companyId).toBe('company-1')
      expect(result!.serviceModes).toEqual([ServiceMode.PICKUP, ServiceMode.DELIVERY])
    })

    it('should return null when not found', async () => {
      mockPrisma.branch.findFirst.mockResolvedValue(null)

      const result = await repository.findById('non-existent', 'company-1')

      expect(result).toBeNull()
    })
  })

  describe('findByCompanyId', () => {
    it('should return all branches for a company', async () => {
      mockPrisma.branch.findMany.mockResolvedValue([mockPrismaBranch])

      const result = await repository.findByCompanyId('company-1')

      expect(mockPrisma.branch.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
        include: { operatingHours: true },
      })
      expect(result).toHaveLength(1)
      expect(result[0].companyId).toBe('company-1')
    })
  })

  describe('save', () => {
    it('should upsert the branch and return domain entity', async () => {
      const branch = Branch.create({
        id: 'branch-1',
        companyId: 'company-1',
        name: 'Downtown Branch',
        address: '123 Main St',
        phone: '+34600000000',
        email: 'downtown@example.com',
        latitude: 40.4168,
        longitude: -3.7038,
        serviceModes: [ServiceMode.PICKUP, ServiceMode.DELIVERY],
      })

      mockPrisma.branch.upsert.mockResolvedValue(mockPrismaBranch)

      const result = await repository.save(branch)

      expect(mockPrisma.branch.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'branch-1' },
          create: expect.objectContaining({
            id: 'branch-1',
            companyId: 'company-1',
            name: 'Downtown Branch',
          }),
          update: expect.objectContaining({
            id: 'branch-1',
          }),
          include: { operatingHours: true },
        }),
      )
      expect(result.id).toBe('branch-1')
    })
  })

  describe('delete', () => {
    it('should delete branch scoped by companyId', async () => {
      mockPrisma.branch.deleteMany.mockResolvedValue({ count: 1 })

      await repository.delete('branch-1', 'company-1')

      expect(mockPrisma.branch.deleteMany).toHaveBeenCalledWith({
        where: { id: 'branch-1', companyId: 'company-1' },
      })
    })
  })
})
