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

  describe('generateTimeSlots', () => {
    const makeHours = (dayOfWeek: number, openTime: string, closeTime: string, isClosed = false) =>
      OperatingHour.create({ id: '1', branchId: 'b1', dayOfWeek, openTime, closeTime, isClosed })

    // 2026-04-08 = Wednesday (dayOfWeek 3), "now" = 10:00
    const wednesdayNow = new Date('2026-04-08T10:00:00')
    const wednesdayDate = new Date('2026-04-08T00:00:00')

    const wednesdayHours = [
      makeHours(3, '12:00', '22:00'), // Wednesday open 12:00–22:00
    ]

    it('returns empty array when no operating hours for the target day', () => {
      const mondayHours = [makeHours(1, '12:00', '22:00')]
      const slots = service.generateTimeSlots(mondayHours, wednesdayDate, wednesdayNow, 30)
      expect(slots).toEqual([])
    })

    it('returns empty array when day is marked as closed', () => {
      const closedHours = [makeHours(3, '12:00', '22:00', true)]
      const slots = service.generateTimeSlots(closedHours, wednesdayDate, wednesdayNow, 30)
      expect(slots).toEqual([])
    })

    it('generates slots every 30 minutes within opening hours', () => {
      // now = 10:00, branch opens 12:00–22:00 → all slots from 12:00 to 21:30
      const slots = service.generateTimeSlots(wednesdayHours, wednesdayDate, wednesdayNow, 30)
      expect(slots.length).toBeGreaterThan(0)
      expect(slots[0].label).toBe('12:00')
      expect(slots[slots.length - 1].label).toBe('21:30')
    })

    it('excludes slots within the next 30 minutes from now', () => {
      // now = 11:45 → minFromNow = 11*60+45+30 = 735 = 12:15 → first slot >= 12:15 is 12:30
      const now = new Date('2026-04-08T11:45:00')
      const slots = service.generateTimeSlots(wednesdayHours, wednesdayDate, now, 30)
      expect(slots[0].label).toBe('12:30')
    })

    it('returns no slots when all slots are past the buffer', () => {
      const now = new Date('2026-04-08T22:00:00') // after closing
      const slots = service.generateTimeSlots(wednesdayHours, wednesdayDate, now, 30)
      expect(slots).toEqual([])
    })

    it('returns value as ISO string with correct hours and minutes', () => {
      const slots = service.generateTimeSlots(wednesdayHours, wednesdayDate, wednesdayNow, 30)
      const first = slots[0]
      const date = new Date(first.value)
      expect(date.getHours()).toBe(12)
      expect(date.getMinutes()).toBe(0)
    })

    it('does not apply time filter when target date is a future day', () => {
      // now = Wednesday 10:00, target = Thursday 2026-04-09 (dayOfWeek 4)
      const thursdayHours = [makeHours(4, '12:00', '14:00')]
      const thursdayDate = new Date('2026-04-09T00:00:00')
      const slots = service.generateTimeSlots(thursdayHours, thursdayDate, wednesdayNow, 30)
      expect(slots.map((s) => s.label)).toEqual(['12:00', '12:30', '13:00', '13:30'])
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
