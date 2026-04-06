import { ServiceMode } from '@yantar/shared'
import { ManageBranchesService } from '../manage-branches.service'
import { Branch } from '../../../domain/entities/branch.entity'
import { BranchNotFoundError } from '../../../domain/errors/branch-not-found.error'

const mockBranchRepository = {
  findById: jest.fn(),
  findByCompanyId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('ManageBranchesService', () => {
  let service: ManageBranchesService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ManageBranchesService(mockBranchRepository)
  })

  describe('createBranch', () => {
    it('should create and save a new branch', async () => {
      mockBranchRepository.save.mockImplementation(async (b: Branch) => b)

      const result = await service.createBranch('company-1', {
        name: 'Downtown',
        address: '123 Main St',
        phone: '+34600000000',
        serviceModes: [ServiceMode.PICKUP, ServiceMode.DELIVERY],
      })

      expect(result.name).toBe('Downtown')
      expect(result.address).toBe('123 Main St')
      expect(result.companyId).toBe('company-1')
      expect(result.serviceModes).toEqual([ServiceMode.PICKUP, ServiceMode.DELIVERY])
      expect(mockBranchRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateBranch', () => {
    it('should load, update and save the branch', async () => {
      const existing = Branch.create({
        id: 'branch-1',
        companyId: 'company-1',
        name: 'Downtown',
        address: '123 Main St',
        serviceModes: [ServiceMode.PICKUP],
      })

      mockBranchRepository.findById.mockResolvedValue(existing)
      mockBranchRepository.save.mockImplementation(async (b: Branch) => b)

      const result = await service.updateBranch('company-1', 'branch-1', {
        name: 'Uptown',
        serviceModes: [ServiceMode.PICKUP, ServiceMode.DELIVERY],
      })

      expect(result.name).toBe('Uptown')
      expect(result.serviceModes).toEqual([ServiceMode.PICKUP, ServiceMode.DELIVERY])
      expect(result.address).toBe('123 Main St')
    })

    it('should throw BranchNotFoundError when branch does not exist', async () => {
      mockBranchRepository.findById.mockResolvedValue(null)

      await expect(
        service.updateBranch('company-1', 'non-existent', { name: 'X' }),
      ).rejects.toThrow(BranchNotFoundError)
    })
  })

  describe('deleteBranch', () => {
    it('should delete an existing branch', async () => {
      const existing = Branch.create({
        id: 'branch-1',
        companyId: 'company-1',
        name: 'Downtown',
        address: '123 Main St',
        serviceModes: [ServiceMode.PICKUP],
      })

      mockBranchRepository.findById.mockResolvedValue(existing)
      mockBranchRepository.delete.mockResolvedValue(undefined)

      await service.deleteBranch('company-1', 'branch-1')

      expect(mockBranchRepository.delete).toHaveBeenCalledWith('branch-1', 'company-1')
    })

    it('should throw BranchNotFoundError when branch does not exist', async () => {
      mockBranchRepository.findById.mockResolvedValue(null)

      await expect(
        service.deleteBranch('company-1', 'non-existent'),
      ).rejects.toThrow(BranchNotFoundError)
    })
  })

  describe('listBranches', () => {
    it('should return all branches for a company', async () => {
      const branches = [
        Branch.create({
          id: 'branch-1',
          companyId: 'company-1',
          name: 'Downtown',
          address: '123 Main St',
          serviceModes: [ServiceMode.PICKUP],
        }),
        Branch.create({
          id: 'branch-2',
          companyId: 'company-1',
          name: 'Uptown',
          address: '456 Oak Ave',
          serviceModes: [ServiceMode.DELIVERY],
        }),
      ]

      mockBranchRepository.findByCompanyId.mockResolvedValue(branches)

      const result = await service.listBranches('company-1')

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Downtown')
      expect(result[1].name).toBe('Uptown')
    })
  })
})
