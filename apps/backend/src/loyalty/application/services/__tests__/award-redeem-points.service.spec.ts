import { AwardPointsService } from '../award-points.service'
import { RedeemPointsService } from '../redeem-points.service'
import { LoyaltyAccount } from '../../../domain/entities/loyalty-account.entity'
import { InsufficientPointsError } from '../../../domain/errors/insufficient-points.error'
import { LoyaltyRules } from '../../../domain/ports/loyalty-config-repository.port'

const defaultRules: LoyaltyRules = {
  pointsPerEuro: 1.0,
  pointValueCents: 1.0,
  minRedeemPoints: 100,
  isEnabled: true,
}

const makeAccount = (balance = 0) =>
  new LoyaltyAccount({
    id: 'acc-1',
    customerId: 'user-1',
    companyId: 'company-1',
    currentBalance: balance,
    totalPointsEarned: balance,
    totalPointsRedeemed: 0,
  })

describe('AwardPointsService', () => {
  let service: AwardPointsService
  let accountRepo: jest.Mocked<any>
  let transactionRepo: jest.Mocked<any>
  let configRepo: jest.Mocked<any>

  beforeEach(() => {
    accountRepo = {
      getOrCreate: jest.fn(),
      save: jest.fn(),
      getByCustomer: jest.fn(),
    }
    transactionRepo = { create: jest.fn(), getHistory: jest.fn() }
    configRepo = { getByCompany: jest.fn(), upsert: jest.fn() }

    service = new AwardPointsService(accountRepo, transactionRepo, configRepo)
  })

  it('should award points for a completed order', async () => {
    const account = makeAccount(0)
    accountRepo.getOrCreate.mockResolvedValue(account)
    accountRepo.save.mockResolvedValue(undefined)
    transactionRepo.create.mockResolvedValue({})
    configRepo.getByCompany.mockResolvedValue(defaultRules)

    const result = await service.execute('user-1', 'company-1', 20.0, 'order-1')

    expect(result.currentBalance).toBe(20)
    expect(accountRepo.save).toHaveBeenCalledWith(account)
    expect(transactionRepo.create).toHaveBeenCalledTimes(1)
  })

  it('should award 0 points when loyalty is disabled', async () => {
    const account = makeAccount(10)
    accountRepo.getOrCreate.mockResolvedValue(account)
    configRepo.getByCompany.mockResolvedValue({ ...defaultRules, isEnabled: false })

    const result = await service.execute('user-1', 'company-1', 20.0, 'order-1')

    expect(result.currentBalance).toBe(10)
    expect(accountRepo.save).not.toHaveBeenCalled()
  })

  it('should award 0 points when no config exists', async () => {
    const account = makeAccount(5)
    accountRepo.getOrCreate.mockResolvedValue(account)
    configRepo.getByCompany.mockResolvedValue(null)

    const result = await service.execute('user-1', 'company-1', 20.0, 'order-1')

    expect(result.currentBalance).toBe(5)
    expect(accountRepo.save).not.toHaveBeenCalled()
  })
})

describe('RedeemPointsService', () => {
  let service: RedeemPointsService
  let accountRepo: jest.Mocked<any>
  let transactionRepo: jest.Mocked<any>
  let rewardRepo: jest.Mocked<any>
  let configRepo: jest.Mocked<any>

  beforeEach(() => {
    accountRepo = {
      getByCustomer: jest.fn(),
      getOrCreate: jest.fn(),
      save: jest.fn(),
    }
    transactionRepo = { create: jest.fn(), getHistory: jest.fn() }
    rewardRepo = { getAvailable: jest.fn(), getById: jest.fn(), update: jest.fn(), create: jest.fn(), delete: jest.fn() }
    configRepo = { getByCompany: jest.fn(), upsert: jest.fn() }

    service = new RedeemPointsService(accountRepo, transactionRepo, rewardRepo, configRepo)
  })

  it('should redeem points and return discount value', async () => {
    const account = makeAccount(200)
    accountRepo.getByCustomer.mockResolvedValue(account)
    accountRepo.save.mockResolvedValue(undefined)
    transactionRepo.create.mockResolvedValue({})
    rewardRepo.getById.mockResolvedValue(null)
    configRepo.getByCompany.mockResolvedValue(defaultRules)

    const result = await service.execute('user-1', 'company-1', 100)

    expect(result.account.currentBalance).toBe(100)
    expect(result.discountValue).toBe(1.0) // 100 points * 1 cent = 1€
  })

  it('should throw InsufficientPointsError when balance is too low', async () => {
    const account = makeAccount(50)
    accountRepo.getByCustomer.mockResolvedValue(account)
    configRepo.getByCompany.mockResolvedValue(defaultRules)

    await expect(service.execute('user-1', 'company-1', 100)).rejects.toThrow(
      InsufficientPointsError,
    )
  })
})
