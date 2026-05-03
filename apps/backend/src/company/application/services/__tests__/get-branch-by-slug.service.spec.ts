import { ServiceMode } from '@yantar/shared'
import { GetBranchBySlugService } from '../get-branch-by-slug.service'
import { Branch } from '../../../domain/entities/branch.entity'
import { CompanyNotFoundError } from '../../../domain/errors/company-not-found.error'
import { BranchNotFoundError } from '../../../domain/errors/branch-not-found.error'

describe('GetBranchBySlugService', () => {
  let service: GetBranchBySlugService
  let companyRepo: { findBySlug: jest.Mock }
  let branchRepo: { findBySlug: jest.Mock }

  beforeEach(() => {
    companyRepo = { findBySlug: jest.fn() }
    branchRepo = { findBySlug: jest.fn() }
    service = new GetBranchBySlugService(companyRepo as any, branchRepo as any)
  })

  it('throws CompanyNotFoundError when company slug does not exist', async () => {
    companyRepo.findBySlug.mockResolvedValue(null)

    await expect(service.execute('unknown', 'centro')).rejects.toThrow(
      CompanyNotFoundError,
    )
  })

  it('throws BranchNotFoundError when branch slug does not exist in the company', async () => {
    companyRepo.findBySlug.mockResolvedValue({ id: 'c1', slug: 'napoli' })
    branchRepo.findBySlug.mockResolvedValue(null)

    await expect(service.execute('napoli', 'missing')).rejects.toThrow(
      BranchNotFoundError,
    )
  })

  it('returns the branch as a BranchResponse', async () => {
    const branch = Branch.create({
      id: 'b1',
      companyId: 'c1',
      slug: 'centro',
      name: 'Sede Centro',
      address: 'Calle Mayor 12',
      serviceModes: [ServiceMode.PICKUP, ServiceMode.DELIVERY],
    })
    companyRepo.findBySlug.mockResolvedValue({ id: 'c1', slug: 'napoli' })
    branchRepo.findBySlug.mockResolvedValue(branch)

    const result = await service.execute('napoli', 'centro')

    expect(result.id).toBe('b1')
    expect(result.slug).toBe('centro')
    expect(result.name).toBe('Sede Centro')
    expect(branchRepo.findBySlug).toHaveBeenCalledWith('centro', 'c1')
  })
})
