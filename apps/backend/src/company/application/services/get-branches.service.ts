import { Injectable, Inject } from '@nestjs/common'
import { ICompanyRepository } from '../../domain/ports/company-repository.port'
import { IBranchRepository } from '../../domain/ports/branch-repository.port'
import { CompanyNotFoundError } from '../../domain/errors/company-not-found.error'
import { Branch } from '../../domain/entities/branch.entity'

export interface BranchSummary {
  id: string
  slug: string
  name: string
  address: string
  serviceModes: string[]
}

@Injectable()
export class GetBranchesService {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IBranchRepository')
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(slug: string): Promise<BranchSummary[]> {
    const company = await this.companyRepository.findBySlug(slug)
    if (!company) throw new CompanyNotFoundError(slug)

    const branches = await this.branchRepository.findByCompanyId(company.id)
    return branches
      .filter((b: Branch) => b.isActive)
      .map((b: Branch) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        address: b.address,
        serviceModes: b.serviceModes,
      }))
  }
}
