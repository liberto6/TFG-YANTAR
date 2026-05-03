import { Inject, Injectable } from '@nestjs/common'
import { ICompanyRepository } from '../../domain/ports/company-repository.port'
import { IBranchRepository } from '../../domain/ports/branch-repository.port'
import { CompanyNotFoundError } from '../../domain/errors/company-not-found.error'
import { BranchNotFoundError } from '../../domain/errors/branch-not-found.error'
import { BranchResponse } from '../dtos/branch.dto'

@Injectable()
export class GetBranchBySlugService {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
    @Inject('IBranchRepository')
    private readonly branchRepository: IBranchRepository,
  ) {}

  async execute(
    companySlug: string,
    branchSlug: string,
  ): Promise<BranchResponse> {
    const company = await this.companyRepository.findBySlug(companySlug)
    if (!company) throw new CompanyNotFoundError(companySlug)

    const branch = await this.branchRepository.findBySlug(branchSlug, company.id)
    if (!branch) throw new BranchNotFoundError(branchSlug)

    return BranchResponse.fromEntity(branch)
  }
}
