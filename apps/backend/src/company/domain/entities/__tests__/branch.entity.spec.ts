import { ServiceMode } from '@yantar/shared'
import { Branch } from '../branch.entity'

describe('Branch', () => {
  const defaultProps = {
    id: 'b1',
    companyId: 'c1',
    name: 'Main Branch',
    address: '123 Main St',
    serviceModes: [ServiceMode.DELIVERY, ServiceMode.PICKUP],
  }

  describe('create', () => {
    it('should create a branch with default values', () => {
      const branch = Branch.create(defaultProps)

      expect(branch.id).toBe('b1')
      expect(branch.companyId).toBe('c1')
      expect(branch.name).toBe('Main Branch')
      expect(branch.phone).toBeNull()
      expect(branch.email).toBeNull()
      expect(branch.latitude).toBeNull()
      expect(branch.longitude).toBeNull()
      expect(branch.isActive).toBe(true)
    })

    it('should create a branch with optional fields', () => {
      const branch = Branch.create({
        ...defaultProps,
        phone: '+34600000000',
        email: 'branch@test.com',
        latitude: 40.4168,
        longitude: -3.7038,
      })

      expect(branch.phone).toBe('+34600000000')
      expect(branch.email).toBe('branch@test.com')
      expect(branch.latitude).toBe(40.4168)
      expect(branch.longitude).toBe(-3.7038)
    })
  })

  describe('supportsDelivery / supportsPickup', () => {
    it('should return true for supported modes', () => {
      const branch = Branch.create(defaultProps)
      expect(branch.supportsDelivery()).toBe(true)
      expect(branch.supportsPickup()).toBe(true)
    })

    it('should return false for unsupported modes', () => {
      const branch = Branch.create({
        ...defaultProps,
        serviceModes: [ServiceMode.PICKUP],
      })
      expect(branch.supportsDelivery()).toBe(false)
      expect(branch.supportsPickup()).toBe(true)
    })
  })

  describe('hasLocation', () => {
    it('should return false when no coordinates', () => {
      const branch = Branch.create(defaultProps)
      expect(branch.hasLocation()).toBe(false)
    })

    it('should return true when coordinates are set', () => {
      const branch = Branch.create({
        ...defaultProps,
        latitude: 40.4168,
        longitude: -3.7038,
      })
      expect(branch.hasLocation()).toBe(true)
    })
  })

  describe('activate / deactivate', () => {
    it('should deactivate and reactivate', () => {
      const branch = Branch.create(defaultProps)
      const deactivated = branch.deactivate()
      expect(deactivated.isActive).toBe(false)
      expect(deactivated).not.toBe(branch)

      const reactivated = deactivated.activate()
      expect(reactivated.isActive).toBe(true)
    })
  })

  describe('update', () => {
    it('should return a new instance with updated fields', () => {
      const branch = Branch.create(defaultProps)
      const updated = branch.update({ name: 'Updated Branch' })

      expect(updated).not.toBe(branch)
      expect(updated.name).toBe('Updated Branch')
      expect(updated.address).toBe('123 Main St')
    })
  })

  describe('restore', () => {
    it('should reconstitute all fields', () => {
      const now = new Date()
      const branch = Branch.restore({
        id: 'b1',
        companyId: 'c1',
        name: 'Restored',
        address: '456 Elm St',
        phone: '+34600000000',
        email: 'r@test.com',
        latitude: 40.0,
        longitude: -3.0,
        serviceModes: [ServiceMode.DELIVERY],
        isActive: false,
        createdAt: now,
        updatedAt: now,
      })

      expect(branch.id).toBe('b1')
      expect(branch.name).toBe('Restored')
      expect(branch.isActive).toBe(false)
      expect(branch.phone).toBe('+34600000000')
    })
  })
})
