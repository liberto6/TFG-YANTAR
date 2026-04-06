import { OperatingHour } from '../operating-hour.vo'

describe('OperatingHour', () => {
  describe('isOpenAt', () => {
    it('should return true when time is within open hours', () => {
      const hour = OperatingHour.forDay(1, '09:00', '22:00')
      expect(hour.isOpenAt('12:00')).toBe(true)
    })

    it('should return false when time is outside open hours', () => {
      const hour = OperatingHour.forDay(1, '09:00', '22:00')
      expect(hour.isOpenAt('23:00')).toBe(false)
    })

    it('should return false when day is closed', () => {
      const hour = OperatingHour.create({
        id: '1',
        branchId: 'b1',
        dayOfWeek: 0,
        openTime: '09:00',
        closeTime: '22:00',
        isClosed: true,
      })
      expect(hour.isOpenAt('12:00')).toBe(false)
    })

    it('should return true at exactly open time', () => {
      const hour = OperatingHour.forDay(1, '09:00', '22:00')
      expect(hour.isOpenAt('09:00')).toBe(true)
    })

    it('should return false at exactly close time', () => {
      const hour = OperatingHour.forDay(1, '09:00', '22:00')
      expect(hour.isOpenAt('22:00')).toBe(false)
    })
  })

  describe('forDay', () => {
    it('should create an operating hour for a specific day', () => {
      const hour = OperatingHour.forDay(3, '10:00', '18:00')

      expect(hour.dayOfWeek).toBe(3)
      expect(hour.openTime).toBe('10:00')
      expect(hour.closeTime).toBe('18:00')
      expect(hour.isClosed).toBe(false)
    })
  })

  describe('restore', () => {
    it('should reconstitute all fields', () => {
      const hour = OperatingHour.restore({
        id: 'oh1',
        branchId: 'b1',
        dayOfWeek: 5,
        openTime: '08:00',
        closeTime: '23:00',
        isClosed: false,
      })

      expect(hour.id).toBe('oh1')
      expect(hour.branchId).toBe('b1')
      expect(hour.dayOfWeek).toBe(5)
    })
  })
})
