import { GetTimeSlotsService } from '../get-time-slots.service'
import { BranchNotFoundError } from '../../../domain/errors/branch-not-found.error'
import { Branch } from '../../../domain/entities/branch.entity'
import { OperatingHour } from '../../../domain/value-objects/operating-hour.vo'
import { ServiceMode } from '@yantar/shared'

const makeBranch = (id: string, companyId: string) =>
  Branch.restore({
    id,
    companyId,
    name: 'Branch',
    address: 'Calle Test 1',
    phone: null,
    email: null,
    latitude: null,
    longitude: null,
    serviceModes: [ServiceMode.PICKUP, ServiceMode.DELIVERY],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

const makeHour = (dayOfWeek: number, open: string, close: string, isClosed = false) =>
  OperatingHour.create({ id: `h-${dayOfWeek}`, branchId: 'b1', dayOfWeek, openTime: open, closeTime: close, isClosed })

describe('GetTimeSlotsService', () => {
  let service: GetTimeSlotsService
  let branchRepo: { findById: jest.Mock }
  let hoursRepo: { findByBranchId: jest.Mock }

  beforeEach(() => {
    branchRepo = { findById: jest.fn() }
    hoursRepo = { findByBranchId: jest.fn() }
    service = new GetTimeSlotsService(branchRepo as any, hoursRepo as any)
  })

  it('throws BranchNotFoundError when branch does not exist', async () => {
    branchRepo.findById.mockResolvedValue(null)

    await expect(
      service.execute({ companyId: 'c1', branchId: 'b1', date: '2026-04-08' }),
    ).rejects.toThrow(BranchNotFoundError)
  })

  it('returns empty slots array when branch is closed on target day', async () => {
    branchRepo.findById.mockResolvedValue(makeBranch('b1', 'c1'))
    hoursRepo.findByBranchId.mockResolvedValue([
      makeHour(3, '12:00', '22:00', true), // Wednesday closed
    ])

    // 2026-04-08 = Wednesday, "now" at 10:00
    const result = await service.execute({
      companyId: 'c1',
      branchId: 'b1',
      date: '2026-04-08',
      now: new Date('2026-04-08T10:00:00'),
    })

    expect(result.slots).toEqual([])
  })

  it('returns available slots for an open branch', async () => {
    branchRepo.findById.mockResolvedValue(makeBranch('b1', 'c1'))
    hoursRepo.findByBranchId.mockResolvedValue([
      makeHour(3, '12:00', '14:00'), // Wednesday 12:00–14:00
    ])

    const result = await service.execute({
      companyId: 'c1',
      branchId: 'b1',
      date: '2026-04-08',
      now: new Date('2026-04-08T10:00:00'),
    })

    expect(result.slots.map((s) => s.label)).toEqual(['12:00', '12:30', '13:00', '13:30'])
    expect(result.date).toBe('2026-04-08')
  })

  it('returns the correct date in the response', async () => {
    branchRepo.findById.mockResolvedValue(makeBranch('b1', 'c1'))
    hoursRepo.findByBranchId.mockResolvedValue([makeHour(4, '12:00', '14:00')])

    const result = await service.execute({
      companyId: 'c1',
      branchId: 'b1',
      date: '2026-04-09', // Thursday
      now: new Date('2026-04-08T10:00:00'),
    })

    expect(result.date).toBe('2026-04-09')
  })

  it('defaults to today when no date is provided', async () => {
    branchRepo.findById.mockResolvedValue(makeBranch('b1', 'c1'))
    hoursRepo.findByBranchId.mockResolvedValue([])

    const result = await service.execute({
      companyId: 'c1',
      branchId: 'b1',
    })

    const today = new Date().toISOString().slice(0, 10)
    expect(result.date).toBe(today)
  })
})
