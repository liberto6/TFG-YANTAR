import { ManageDeliveryZonesService } from '../manage-delivery-zones.service'
import { DeliveryZone } from '../../../domain/entities/delivery-zone.entity'
import { DeliveryZoneNotFoundError } from '../../../domain/errors/delivery-zone-not-found.error'

const mockDeliveryZoneRepository = {
  findById: jest.fn(),
  findByBranchId: jest.fn(),
  findByCompanyId: jest.fn(),
  findByPostalCode: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('ManageDeliveryZonesService', () => {
  let service: ManageDeliveryZonesService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ManageDeliveryZonesService(mockDeliveryZoneRepository)
  })

  describe('createZone', () => {
    it('should create and save a new delivery zone', async () => {
      mockDeliveryZoneRepository.save.mockImplementation(
        async (zone: DeliveryZone) => zone,
      )

      const result = await service.createZone('company-1', 'branch-1', {
        name: 'City Center',
        postalCodes: ['28001', '28002'],
        minOrderAmount: 10,
        deliveryFee: 2.5,
        estimatedTimeMinutes: 30,
      })

      expect(result.name).toBe('City Center')
      expect(result.companyId).toBe('company-1')
      expect(result.branchId).toBe('branch-1')
      expect(result.postalCodes).toEqual(['28001', '28002'])
      expect(result.minOrderAmount).toBe(10)
      expect(result.deliveryFee).toBe(2.5)
      expect(result.estimatedTimeMinutes).toBe(30)
      expect(mockDeliveryZoneRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateZone', () => {
    it('should load, update and save the zone', async () => {
      const existing = DeliveryZone.create({
        id: 'zone-1',
        branchId: 'branch-1',
        companyId: 'company-1',
        name: 'City Center',
        postalCodes: ['28001'],
        minOrderAmount: 10,
        deliveryFee: 2.5,
        estimatedTimeMinutes: 30,
      })

      mockDeliveryZoneRepository.findById.mockResolvedValue(existing)
      mockDeliveryZoneRepository.save.mockImplementation(
        async (zone: DeliveryZone) => zone,
      )

      const result = await service.updateZone('company-1', 'zone-1', {
        name: 'Extended Center',
        postalCodes: ['28001', '28002', '28003'],
        deliveryFee: 3.0,
      })

      expect(result.name).toBe('Extended Center')
      expect(result.postalCodes).toEqual(['28001', '28002', '28003'])
      expect(result.deliveryFee).toBe(3.0)
      expect(result.minOrderAmount).toBe(10)
    })

    it('should throw DeliveryZoneNotFoundError when zone does not exist', async () => {
      mockDeliveryZoneRepository.findById.mockResolvedValue(null)

      await expect(
        service.updateZone('company-1', 'non-existent', { name: 'X' }),
      ).rejects.toThrow(DeliveryZoneNotFoundError)
    })

    it('should throw DeliveryZoneNotFoundError when zone belongs to different company', async () => {
      const zone = DeliveryZone.create({
        id: 'zone-1',
        branchId: 'branch-1',
        companyId: 'other-company',
        name: 'Zone',
        postalCodes: ['28001'],
        minOrderAmount: 0,
        deliveryFee: 0,
        estimatedTimeMinutes: 30,
      })

      mockDeliveryZoneRepository.findById.mockResolvedValue(zone)

      await expect(
        service.updateZone('company-1', 'zone-1', { name: 'X' }),
      ).rejects.toThrow(DeliveryZoneNotFoundError)
    })
  })

  describe('deleteZone', () => {
    it('should delete an existing zone', async () => {
      const zone = DeliveryZone.create({
        id: 'zone-1',
        branchId: 'branch-1',
        companyId: 'company-1',
        name: 'Zone',
        postalCodes: ['28001'],
        minOrderAmount: 0,
        deliveryFee: 0,
        estimatedTimeMinutes: 30,
      })

      mockDeliveryZoneRepository.findById.mockResolvedValue(zone)
      mockDeliveryZoneRepository.delete.mockResolvedValue(undefined)

      await service.deleteZone('company-1', 'zone-1')

      expect(mockDeliveryZoneRepository.delete).toHaveBeenCalledWith('zone-1')
    })

    it('should throw DeliveryZoneNotFoundError when zone does not exist', async () => {
      mockDeliveryZoneRepository.findById.mockResolvedValue(null)

      await expect(
        service.deleteZone('company-1', 'non-existent'),
      ).rejects.toThrow(DeliveryZoneNotFoundError)
    })

    it('should throw DeliveryZoneNotFoundError when zone belongs to different company', async () => {
      const zone = DeliveryZone.create({
        id: 'zone-1',
        branchId: 'branch-1',
        companyId: 'other-company',
        name: 'Zone',
        postalCodes: ['28001'],
        minOrderAmount: 0,
        deliveryFee: 0,
        estimatedTimeMinutes: 30,
      })

      mockDeliveryZoneRepository.findById.mockResolvedValue(zone)

      await expect(
        service.deleteZone('company-1', 'zone-1'),
      ).rejects.toThrow(DeliveryZoneNotFoundError)
    })
  })

  describe('listZones', () => {
    it('should return all zones for a branch', async () => {
      const zones = [
        DeliveryZone.create({
          id: 'zone-1',
          branchId: 'branch-1',
          companyId: 'company-1',
          name: 'Zone A',
          postalCodes: ['28001'],
          minOrderAmount: 10,
          deliveryFee: 2.5,
          estimatedTimeMinutes: 30,
        }),
        DeliveryZone.create({
          id: 'zone-2',
          branchId: 'branch-1',
          companyId: 'company-1',
          name: 'Zone B',
          postalCodes: ['28010'],
          minOrderAmount: 15,
          deliveryFee: 4.0,
          estimatedTimeMinutes: 45,
        }),
      ]

      mockDeliveryZoneRepository.findByBranchId.mockResolvedValue(zones)

      const result = await service.listZones('branch-1')

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Zone A')
      expect(result[1].name).toBe('Zone B')
    })
  })
})
