import { PointsCalculationService } from '../points-calculation.service'
import { LoyaltyRules } from '../../ports/loyalty-config-repository.port'

const defaultRules: LoyaltyRules = {
  pointsPerEuro: 1.0,
  pointValueCents: 1.0,
  minRedeemPoints: 100,
  isEnabled: true,
}

describe('PointsCalculationService', () => {
  describe('calculatePointsForOrder', () => {
    it('should return 0 when loyalty is disabled', () => {
      const rules = { ...defaultRules, isEnabled: false }
      expect(PointsCalculationService.calculatePointsForOrder(20, rules)).toBe(0)
    })

    it('should return 0 for zero or negative total', () => {
      expect(PointsCalculationService.calculatePointsForOrder(0, defaultRules)).toBe(0)
      expect(PointsCalculationService.calculatePointsForOrder(-5, defaultRules)).toBe(0)
    })

    it('should award 1 point per euro with default rules', () => {
      expect(PointsCalculationService.calculatePointsForOrder(20, defaultRules)).toBe(20)
    })

    it('should floor fractional points', () => {
      expect(PointsCalculationService.calculatePointsForOrder(20.75, defaultRules)).toBe(20)
    })

    it('should respect custom pointsPerEuro ratio', () => {
      const rules = { ...defaultRules, pointsPerEuro: 2.0 }
      expect(PointsCalculationService.calculatePointsForOrder(15, rules)).toBe(30)
    })
  })

  describe('calculateDiscountValue', () => {
    it('should return 0 for zero points', () => {
      expect(PointsCalculationService.calculateDiscountValue(0, defaultRules)).toBe(0)
    })

    it('should return 0.01€ per point with default rules (1 cent per point)', () => {
      expect(PointsCalculationService.calculateDiscountValue(100, defaultRules)).toBe(1.0)
    })

    it('should handle fractional euros correctly', () => {
      expect(PointsCalculationService.calculateDiscountValue(50, defaultRules)).toBe(0.5)
    })

    it('should respect custom pointValueCents', () => {
      const rules = { ...defaultRules, pointValueCents: 2.0 }
      expect(PointsCalculationService.calculateDiscountValue(100, rules)).toBe(2.0)
    })
  })

  describe('pointsNeededForDiscount', () => {
    it('should need 100 points for 1€ discount with default rules', () => {
      expect(PointsCalculationService.pointsNeededForDiscount(1, defaultRules)).toBe(100)
    })

    it('should ceil fractional points needed', () => {
      // 0.5€ = 50 points exactly
      expect(PointsCalculationService.pointsNeededForDiscount(0.5, defaultRules)).toBe(50)
    })
  })
})
