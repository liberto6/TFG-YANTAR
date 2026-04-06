import { DeliveryZone } from '../delivery-zone.entity'

describe('DeliveryZone', () => {
  const defaultProps = {
    id: 'dz1',
    branchId: 'b1',
    companyId: 'c1',
    name: 'Centro',
    postalCodes: ['28001', '28002', '28003'],
    minOrderAmount: 10,
    deliveryFee: 2.5,
    estimatedTimeMinutes: 30,
  }

  describe('create', () => {
    it('should create a delivery zone with isActive true', () => {
      const zone = DeliveryZone.create(defaultProps)

      expect(zone.id).toBe('dz1')
      expect(zone.name).toBe('Centro')
      expect(zone.postalCodes).toEqual(['28001', '28002', '28003'])
      expect(zone.isActive).toBe(true)
    })
  })

  describe('coversPostalCode', () => {
    it('should return true for a covered postal code', () => {
      const zone = DeliveryZone.create(defaultProps)
      expect(zone.coversPostalCode('28001')).toBe(true)
    })

    it('should return false for an uncovered postal code', () => {
      const zone = DeliveryZone.create(defaultProps)
      expect(zone.coversPostalCode('29001')).toBe(false)
    })
  })

  describe('update', () => {
    it('should return a new instance with updated fields', () => {
      const zone = DeliveryZone.create(defaultProps)
      const updated = zone.update({ deliveryFee: 5.0 })

      expect(updated).not.toBe(zone)
      expect(updated.deliveryFee).toBe(5.0)
      expect(updated.name).toBe('Centro')
    })
  })

  describe('activate / deactivate', () => {
    it('should deactivate and reactivate', () => {
      const zone = DeliveryZone.create(defaultProps)
      const deactivated = zone.deactivate()
      expect(deactivated.isActive).toBe(false)

      const reactivated = deactivated.activate()
      expect(reactivated.isActive).toBe(true)
    })
  })

  describe('restore', () => {
    it('should reconstitute all fields', () => {
      const zone = DeliveryZone.restore({
        ...defaultProps,
        isActive: false,
      })

      expect(zone.id).toBe('dz1')
      expect(zone.isActive).toBe(false)
      expect(zone.minOrderAmount).toBe(10)
    })
  })
})
