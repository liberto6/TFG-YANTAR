import { TransactionType, RewardType } from '@yantar/shared'
import { GetBalanceService } from '../get-balance.service'
import { GetRewardsService } from '../get-rewards.service'
import { GetPointsHistoryService } from '../get-points-history.service'
import { LoyaltyAccount } from '../../../domain/entities/loyalty-account.entity'
import { Reward } from '../../../domain/entities/reward.entity'
import { PointsTransaction } from '../../../domain/entities/points-transaction.entity'

// ── helpers ──────────────────────────────────────────────────────────────────

const makeAccount = (balance = 50) =>
  new LoyaltyAccount({
    id: 'acc-1',
    customerId: 'user-1',
    companyId: 'co-1',
    currentBalance: balance,
    totalPointsEarned: balance,
    totalPointsRedeemed: 0,
  })

const makeReward = (overrides: Partial<ConstructorParameters<typeof Reward>[0]> = {}) =>
  new Reward({
    id: 'rew-1',
    companyId: 'co-1',
    name: '5% descuento',
    description: null,
    type: RewardType.DISCOUNT_PERCENT,
    pointsCost: 100,
    value: '5',
    isActive: true,
    stock: null,
    validFrom: null,
    validUntil: null,
    ...overrides,
  })

const makeTx = (type: TransactionType = TransactionType.EARNED, points = 10) =>
  new PointsTransaction({
    id: 'tx-1',
    accountId: 'acc-1',
    type,
    points,
    reason: 'Test',
    orderId: null,
    rewardId: null,
  })

// ── GetBalanceService ─────────────────────────────────────────────────────────

describe('GetBalanceService', () => {
  let service: GetBalanceService
  let accountRepo: jest.Mocked<any>

  beforeEach(() => {
    accountRepo = { getOrCreate: jest.fn(), save: jest.fn(), getByCustomer: jest.fn() }
    service = new GetBalanceService(accountRepo)
  })

  it('should return balance DTO for an existing account', async () => {
    accountRepo.getOrCreate.mockResolvedValue(makeAccount(75))

    const result = await service.execute('user-1', 'co-1')

    expect(result.currentBalance).toBe(75)
    expect(result.customerId).toBe('user-1')
    expect(result.companyId).toBe('co-1')
    expect(accountRepo.getOrCreate).toHaveBeenCalledWith('user-1', 'co-1', expect.any(String))
  })

  it('should return zero balance for a newly created account', async () => {
    accountRepo.getOrCreate.mockResolvedValue(makeAccount(0))

    const result = await service.execute('new-user', 'co-1')

    expect(result.currentBalance).toBe(0)
    expect(result.totalPointsEarned).toBe(0)
    expect(result.totalPointsRedeemed).toBe(0)
  })
})

// ── GetRewardsService ─────────────────────────────────────────────────────────

describe('GetRewardsService', () => {
  let service: GetRewardsService
  let rewardRepo: jest.Mocked<any>

  beforeEach(() => {
    rewardRepo = { getAvailable: jest.fn(), getById: jest.fn(), update: jest.fn(), create: jest.fn(), delete: jest.fn() }
    service = new GetRewardsService(rewardRepo)
  })

  it('should return available rewards as DTOs', async () => {
    const reward = makeReward()
    rewardRepo.getAvailable.mockResolvedValue([reward])

    const result = await service.execute('co-1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rew-1')
    expect(result[0].name).toBe('5% descuento')
    expect(result[0].isAvailable).toBe(true)
    expect(rewardRepo.getAvailable).toHaveBeenCalledWith('co-1')
  })

  it('should return empty array when no rewards available', async () => {
    rewardRepo.getAvailable.mockResolvedValue([])

    const result = await service.execute('co-1')

    expect(result).toHaveLength(0)
  })

  it('should mark reward as unavailable when stock is 0', async () => {
    const reward = makeReward({ stock: 0 })
    rewardRepo.getAvailable.mockResolvedValue([reward])

    const result = await service.execute('co-1')

    expect(result[0].isAvailable).toBe(false)
  })
})

// ── GetPointsHistoryService ───────────────────────────────────────────────────

describe('GetPointsHistoryService', () => {
  let service: GetPointsHistoryService
  let accountRepo: jest.Mocked<any>
  let transactionRepo: jest.Mocked<any>

  beforeEach(() => {
    accountRepo = { getOrCreate: jest.fn(), save: jest.fn(), getByCustomer: jest.fn() }
    transactionRepo = { create: jest.fn(), getHistory: jest.fn() }
    service = new GetPointsHistoryService(accountRepo, transactionRepo)
  })

  it('should return transaction history for an existing account', async () => {
    accountRepo.getByCustomer.mockResolvedValue(makeAccount())
    transactionRepo.getHistory.mockResolvedValue([
      makeTx(TransactionType.EARNED, 20),
      makeTx(TransactionType.REDEEMED, 10),
    ])

    const result = await service.execute('user-1', 'co-1')

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe(TransactionType.EARNED)
    expect(result[0].points).toBe(20)
    expect(result[1].type).toBe(TransactionType.REDEEMED)
    expect(transactionRepo.getHistory).toHaveBeenCalledWith('acc-1', 20, 0)
  })

  it('should return empty array when account does not exist', async () => {
    accountRepo.getByCustomer.mockResolvedValue(null)

    const result = await service.execute('unknown-user', 'co-1')

    expect(result).toHaveLength(0)
    expect(transactionRepo.getHistory).not.toHaveBeenCalled()
  })

  it('should respect limit and offset parameters', async () => {
    accountRepo.getByCustomer.mockResolvedValue(makeAccount())
    transactionRepo.getHistory.mockResolvedValue([makeTx()])

    await service.execute('user-1', 'co-1', 5, 10)

    expect(transactionRepo.getHistory).toHaveBeenCalledWith('acc-1', 5, 10)
  })
})
