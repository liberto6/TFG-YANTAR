import { RewardType } from '@yantar/shared'
import { Reward } from '../reward.entity'
import { RewardNotAvailableError } from '../../errors/reward-not-available.error'

describe('Reward', () => {
  const makeReward = (overrides: Partial<ConstructorParameters<typeof Reward>[0]> = {}) =>
    new Reward({
      id: 'reward-1',
      companyId: 'company-1',
      name: '1€ de descuento',
      type: RewardType.DISCOUNT_FIXED,
      pointsCost: 100,
      value: '1',
      isActive: true,
      stock: null,
      validFrom: null,
      validUntil: null,
      ...overrides,
    })

  describe('isAvailable', () => {
    it('should return true for an active reward with no restrictions', () => {
      expect(makeReward().isAvailable()).toBe(true)
    })

    it('should return false when inactive', () => {
      expect(makeReward({ isActive: false }).isAvailable()).toBe(false)
    })

    it('should return false when stock is 0', () => {
      expect(makeReward({ stock: 0 }).isAvailable()).toBe(false)
    })

    it('should return true when stock > 0', () => {
      expect(makeReward({ stock: 5 }).isAvailable()).toBe(true)
    })

    it('should return false when validFrom is in the future', () => {
      const future = new Date(Date.now() + 86400000)
      expect(makeReward({ validFrom: future }).isAvailable()).toBe(false)
    })

    it('should return false when validUntil is in the past', () => {
      const past = new Date(Date.now() - 86400000)
      expect(makeReward({ validUntil: past }).isAvailable()).toBe(false)
    })
  })

  describe('consume', () => {
    it('should decrement stock when stock is limited', () => {
      const reward = makeReward({ stock: 3 })
      reward.consume()
      expect(reward.stock).toBe(2)
    })

    it('should not change stock when unlimited', () => {
      const reward = makeReward({ stock: null })
      reward.consume()
      expect(reward.stock).toBeNull()
    })

    it('should throw RewardNotAvailableError when not available', () => {
      const reward = makeReward({ isActive: false })
      expect(() => reward.consume()).toThrow(RewardNotAvailableError)
    })
  })
})
