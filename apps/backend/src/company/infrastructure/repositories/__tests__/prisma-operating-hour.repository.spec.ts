import { PrismaOperatingHourRepository } from '../prisma-operating-hour.repository'
import { OperatingHour } from '../../../domain/value-objects/operating-hour.vo'

const mockPrismaHour = {
  id: 'oh-1',
  branchId: 'branch-1',
  dayOfWeek: 1,
  openTime: '09:00',
  closeTime: '22:00',
  isClosed: false,
}

const mockTx = {
  operatingHour: {
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
}

const mockPrisma = {
  operatingHour: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
}

describe('PrismaOperatingHourRepository', () => {
  let repository: PrismaOperatingHourRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new PrismaOperatingHourRepository(mockPrisma as any)
  })

  describe('findByBranchId', () => {
    it('should return operating hours for a branch', async () => {
      mockPrisma.operatingHour.findMany.mockResolvedValue([mockPrismaHour])

      const result = await repository.findByBranchId('branch-1')

      expect(mockPrisma.operatingHour.findMany).toHaveBeenCalledWith({
        where: { branchId: 'branch-1' },
      })
      expect(result).toHaveLength(1)
      expect(result[0].dayOfWeek).toBe(1)
      expect(result[0].openTime).toBe('09:00')
      expect(result[0].closeTime).toBe('22:00')
      expect(result[0].isClosed).toBe(false)
    })
  })

  describe('replaceForBranch', () => {
    it('should delete all existing hours and create new ones in a transaction', async () => {
      const hours = [
        OperatingHour.create({
          id: 'oh-1',
          branchId: 'branch-1',
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: false,
        }),
        OperatingHour.create({
          id: 'oh-2',
          branchId: 'branch-1',
          dayOfWeek: 2,
          openTime: '10:00',
          closeTime: '21:00',
          isClosed: false,
        }),
      ]

      mockTx.operatingHour.deleteMany.mockResolvedValue({ count: 0 })
      mockTx.operatingHour.create
        .mockResolvedValueOnce(mockPrismaHour)
        .mockResolvedValueOnce({
          ...mockPrismaHour,
          id: 'oh-2',
          dayOfWeek: 2,
          openTime: '10:00',
          closeTime: '21:00',
        })

      const result = await repository.replaceForBranch('branch-1', hours)

      expect(mockPrisma.$transaction).toHaveBeenCalled()
      expect(mockTx.operatingHour.deleteMany).toHaveBeenCalledWith({
        where: { branchId: 'branch-1' },
      })
      expect(mockTx.operatingHour.create).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(2)
    })
  })
})
