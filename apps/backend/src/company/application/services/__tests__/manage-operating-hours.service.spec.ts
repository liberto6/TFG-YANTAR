import { ServiceMode } from '@yantar/shared'
import { ManageOperatingHoursService } from '../manage-operating-hours.service'
import { Branch } from '../../../domain/entities/branch.entity'
import { OperatingHour } from '../../../domain/value-objects/operating-hour.vo'
import { BranchNotFoundError } from '../../../domain/errors/branch-not-found.error'

const mockOperatingHourRepository = {
  findByBranchId: jest.fn(),
  replaceForBranch: jest.fn(),
}

const mockBranchRepository = {
  findById: jest.fn(),
  findByCompanyId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('ManageOperatingHoursService', () => {
  let service: ManageOperatingHoursService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ManageOperatingHoursService(
      mockOperatingHourRepository,
      mockBranchRepository,
    )
  })

  const existingBranch = Branch.create({
    id: 'branch-1',
    companyId: 'company-1',
    name: 'Downtown',
    address: '123 Main St',
    serviceModes: [ServiceMode.PICKUP],
  })

  describe('setHours', () => {
    it('should replace operating hours for a branch', async () => {
      mockBranchRepository.findById.mockResolvedValue(existingBranch)
      mockOperatingHourRepository.replaceForBranch.mockImplementation(
        async (_branchId: string, hours: OperatingHour[]) => hours,
      )

      const result = await service.setHours('company-1', 'branch-1', {
        hours: [
          { dayOfWeek: 1, openTime: '09:00', closeTime: '22:00', isClosed: false },
          { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isClosed: true },
        ],
      })

      expect(result).toHaveLength(2)
      expect(result[0].dayOfWeek).toBe(1)
      expect(result[0].openTime).toBe('09:00')
      expect(result[1].isClosed).toBe(true)
      expect(mockOperatingHourRepository.replaceForBranch).toHaveBeenCalledWith(
        'branch-1',
        expect.any(Array),
      )
    })

    it('should throw BranchNotFoundError when branch does not belong to company', async () => {
      mockBranchRepository.findById.mockResolvedValue(null)

      await expect(
        service.setHours('company-1', 'non-existent', { hours: [] }),
      ).rejects.toThrow(BranchNotFoundError)
    })
  })

  describe('getHours', () => {
    it('should return operating hours for a branch', async () => {
      mockBranchRepository.findById.mockResolvedValue(existingBranch)
      mockOperatingHourRepository.findByBranchId.mockResolvedValue([
        OperatingHour.create({
          id: 'oh-1',
          branchId: 'branch-1',
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '22:00',
          isClosed: false,
        }),
      ])

      const result = await service.getHours('company-1', 'branch-1')

      expect(result).toHaveLength(1)
      expect(result[0].dayOfWeek).toBe(1)
      expect(result[0].id).toBe('oh-1')
    })

    it('should throw BranchNotFoundError when branch does not belong to company', async () => {
      mockBranchRepository.findById.mockResolvedValue(null)

      await expect(
        service.getHours('company-1', 'non-existent'),
      ).rejects.toThrow(BranchNotFoundError)
    })
  })
})
