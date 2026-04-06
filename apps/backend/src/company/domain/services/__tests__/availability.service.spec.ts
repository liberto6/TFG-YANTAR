import { ServiceMode } from '@yantar/shared'
import { AvailabilityService } from '../availability.service'
import { OperatingHour } from '../../value-objects/operating-hour.vo'
import { DeliveryZone } from '../../entities/delivery-zone.entity'
import { Branch } from '../../entities/branch.entity'

describe('AvailabilityService', () => {
  let service: AvailabilityService

  beforeEach(() => {
    service = new AvailabilityService()
  })

  describe('isOpenAt', () => {
    const mondayHours = [
      OperatingHour.create({
        id: '1',
        branchId: 'b1',
        dayOfWeek: 1, // Monday
        openTime: '09:00',
        closeTime: '22:00',
        isClosed: false,
      }),
    ]

    it('should return true when open on Monday at 12:00', () => {
      // Monday 12:00
      const date = new Date('2026-04-06T12:00:00') // 2026-04-06 is a Monday
      expect(service.isOpenAt(mondayHours, date)).toBe(true)
    })

    it('should return false when closed on Monday at 23:00', () => {
      const date = new Date('2026-04-06T23:00:00')
      expect(service.isOpenAt(mondayHours, date)).toBe(false)
    })

    it('should return false when day is marked as closed', () => {
      const closedHours = [
        OperatingHour.create({
          id: '1',
          branchId: 'b1',
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: true,
        }),
      ]
      const date = new Date('2026-04-06T12:00:00')
      expect(service.isOpenAt(closedHours, date)).toBe(false)
    })

    it('should return false when no hours for the day', () => {
      const date = new Date('2026-04-07T12:00:00') // Tuesday
      expect(service.isOpenAt(mondayHours, date)).toBe(false)
    })
  })

  describe('findBranchForPostalCode', () => {
    const zones = [
      DeliveryZone.create({
        id: 'z1',
        branchId: 'b1',
        companyId: 'c1',
        name: 'Centro',
        postalCodes: ['28001', '28002'],
        minOrderAmount: 10,
        deliveryFee: 2.5,
        estimatedTimeMinutes: 30,
      }),
      DeliveryZone.create({
        id: 'z2',
        branchId: 'b2',
        companyId: 'c1',
        name: 'Norte',
        postalCodes: ['28010', '28011'],
        minOrderAmount: 15,
        deliveryFee: 3.5,
        estimatedTimeMinutes: 45,
      }),
    ]

    it('should return the zone matching the postal code', () => {
      const zone = service.findBranchForPostalCode(zones, '28001')
      expect(zone).not.toBeNull()
      expect(zone!.id).toBe('z1')
    })

    it('should return null when no zone matches', () => {
      const zone = service.findBranchForPostalCode(zones, '29001')
      expect(zone).toBeNull()
    })
  })

  describe('findNearestBranch', () => {
    // Madrid: 40.4168, -3.7038
    // Barcelona: 41.3851, 2.1734
    // Valencia: 39.4699, -0.3763
    const branches = [
      Branch.create({
        id: 'b1',
        companyId: 'c1',
        name: 'Barcelona Branch',
        address: 'Barcelona',
        latitude: 41.3851,
        longitude: 2.1734,
        serviceModes: [ServiceMode.DELIVERY],
      }),
      Branch.create({
        id: 'b2',
        companyId: 'c1',
        name: 'Valencia Branch',
        address: 'Valencia',
        latitude: 39.4699,
        longitude: -0.3763,
        serviceModes: [ServiceMode.DELIVERY],
      }),
    ]

    it('should return the nearest branch to Madrid (Valencia is closer)', () => {
      const nearest = service.findNearestBranch(branches, 40.4168, -3.7038)
      expect(nearest).not.toBeNull()
      expect(nearest!.id).toBe('b2') // Valencia is closer to Madrid
    })

    it('should return null when no branches have locations', () => {
      const noLocationBranches = [
        Branch.create({
          id: 'b3',
          companyId: 'c1',
          name: 'No Location',
          address: 'Somewhere',
          serviceModes: [ServiceMode.DELIVERY],
        }),
      ]
      const nearest = service.findNearestBranch(noLocationBranches, 40.0, -3.0)
      expect(nearest).toBeNull()
    })
  })
})
