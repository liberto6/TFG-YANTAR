import { PrismaDeliveryZoneRepository } from '../prisma-delivery-zone.repository'
import { DeliveryZone } from '../../../domain/entities/delivery-zone.entity'

const mockPrismaZone = {
  id: 'zone-1',
  branchId: 'branch-1',
  companyId: 'company-1',
  name: 'City Center',
  postalCodes: ['28001', '28002', '28003'],
  minOrderAmount: 10,
  deliveryFee: 2.5,
  estimatedTimeMinutes: 30,
  isActive: true,
}

const mockPrisma = {
  deliveryZone: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
}

describe('PrismaDeliveryZoneRepository', () => {
  let repository: PrismaDeliveryZoneRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new PrismaDeliveryZoneRepository(mockPrisma as any)
  })

  describe('findById', () => {
    it('should return a domain DeliveryZone when found', async () => {
      mockPrisma.deliveryZone.findUnique.mockResolvedValue(mockPrismaZone)

      const result = await repository.findById('zone-1')

      expect(mockPrisma.deliveryZone.findUnique).toHaveBeenCalledWith({
        where: { id: 'zone-1' },
      })
      expect(result).not.toBeNull()
      expect(result!.id).toBe('zone-1')
      expect(result!.postalCodes).toEqual(['28001', '28002', '28003'])
    })

    it('should return null when not found', async () => {
      mockPrisma.deliveryZone.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByBranchId', () => {
    it('should return all zones for a branch', async () => {
      mockPrisma.deliveryZone.findMany.mockResolvedValue([mockPrismaZone])

      const result = await repository.findByBranchId('branch-1')

      expect(mockPrisma.deliveryZone.findMany).toHaveBeenCalledWith({
        where: { branchId: 'branch-1' },
      })
      expect(result).toHaveLength(1)
    })
  })

  describe('findByCompanyId', () => {
    it('should return all zones for a company', async () => {
      mockPrisma.deliveryZone.findMany.mockResolvedValue([mockPrismaZone])

      const result = await repository.findByCompanyId('company-1')

      expect(mockPrisma.deliveryZone.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1' },
      })
      expect(result).toHaveLength(1)
    })
  })

  describe('findByPostalCode', () => {
    it('should use Prisma has filter for postalCodes array', async () => {
      mockPrisma.deliveryZone.findFirst.mockResolvedValue(mockPrismaZone)

      const result = await repository.findByPostalCode('company-1', '28001')

      expect(mockPrisma.deliveryZone.findFirst).toHaveBeenCalledWith({
        where: { companyId: 'company-1', postalCodes: { has: '28001' } },
      })
      expect(result).not.toBeNull()
    })

    it('should return null when no zone covers the postal code', async () => {
      mockPrisma.deliveryZone.findFirst.mockResolvedValue(null)

      const result = await repository.findByPostalCode('company-1', '99999')

      expect(result).toBeNull()
    })
  })

  describe('save', () => {
    it('should upsert the zone and return domain entity', async () => {
      const zone = DeliveryZone.create({
        id: 'zone-1',
        branchId: 'branch-1',
        companyId: 'company-1',
        name: 'City Center',
        postalCodes: ['28001', '28002'],
        minOrderAmount: 10,
        deliveryFee: 2.5,
        estimatedTimeMinutes: 30,
      })

      mockPrisma.deliveryZone.upsert.mockResolvedValue(mockPrismaZone)

      const result = await repository.save(zone)

      expect(mockPrisma.deliveryZone.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'zone-1' },
          create: expect.objectContaining({
            id: 'zone-1',
            companyId: 'company-1',
          }),
          update: expect.objectContaining({
            id: 'zone-1',
          }),
        }),
      )
      expect(result.id).toBe('zone-1')
    })
  })

  describe('delete', () => {
    it('should delete the zone by id', async () => {
      mockPrisma.deliveryZone.delete.mockResolvedValue(mockPrismaZone)

      await repository.delete('zone-1')

      expect(mockPrisma.deliveryZone.delete).toHaveBeenCalledWith({
        where: { id: 'zone-1' },
      })
    })
  })
})
