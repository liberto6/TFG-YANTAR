import { LoyaltyAccount } from '../loyalty-account.entity'
import { InsufficientPointsError } from '../../errors/insufficient-points.error'

describe('LoyaltyAccount', () => {
  const makeAccount = (balance = 0) =>
    new LoyaltyAccount({
      id: 'acc-1',
      customerId: 'user-1',
      companyId: 'company-1',
      currentBalance: balance,
      totalPointsEarned: balance,
      totalPointsRedeemed: 0,
    })

  describe('award', () => {
    it('should increase balance and totalEarned', () => {
      const acc = makeAccount(0)
      acc.award(50)
      expect(acc.currentBalance).toBe(50)
      expect(acc.totalPointsEarned).toBe(50)
    })

    it('should ignore zero or negative points', () => {
      const acc = makeAccount(10)
      acc.award(0)
      acc.award(-5)
      expect(acc.currentBalance).toBe(10)
    })

    it('should accumulate multiple awards', () => {
      const acc = makeAccount(0)
      acc.award(30)
      acc.award(20)
      expect(acc.currentBalance).toBe(50)
      expect(acc.totalPointsEarned).toBe(50)
    })
  })

  describe('redeem', () => {
    it('should decrease balance and increase totalRedeemed', () => {
      const acc = makeAccount(200)
      acc.redeem(100)
      expect(acc.currentBalance).toBe(100)
      expect(acc.totalPointsRedeemed).toBe(100)
    })

    it('should throw InsufficientPointsError when balance is too low', () => {
      const acc = makeAccount(50)
      expect(() => acc.redeem(100)).toThrow(InsufficientPointsError)
    })

    it('should allow redeeming exact balance', () => {
      const acc = makeAccount(100)
      expect(() => acc.redeem(100)).not.toThrow()
      expect(acc.currentBalance).toBe(0)
    })
  })

  describe('canRedeem', () => {
    it('should return true when balance >= points', () => {
      const acc = makeAccount(100)
      expect(acc.canRedeem(100)).toBe(true)
      expect(acc.canRedeem(50)).toBe(true)
    })

    it('should return false when balance < points', () => {
      const acc = makeAccount(50)
      expect(acc.canRedeem(51)).toBe(false)
    })
  })
})
