import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Branch } from '../../domain/entities/branch.entity'
import { IBranchRepository } from '../../domain/ports/branch-repository.port'
import { BranchNotFoundError } from '../../domain/errors/branch-not-found.error'
import {
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchResponse,
} from '../dtos/branch.dto'

@Injectable()
export class ManageBranchesService {
  constructor(
    @Inject('IBranchRepository')
    private readonly branchRepository: IBranchRepository,
  ) {}

  async createBranch(
    companyId: string,
    request: CreateBranchRequest,
  ): Promise<BranchResponse> {
    const branch = Branch.create({
      id: randomUUID(),
      companyId,
      name: request.name,
      address: request.address,
      phone: request.phone,
      email: request.email,
      latitude: request.latitude,
      longitude: request.longitude,
      serviceModes: request.serviceModes,
    })

    const saved = await this.branchRepository.save(branch)
    return BranchResponse.fromEntity(saved)
  }

  async updateBranch(
    companyId: string,
    branchId: string,
    request: UpdateBranchRequest,
  ): Promise<BranchResponse> {
    const branch = await this.branchRepository.findById(branchId, companyId)
    if (!branch) {
      throw new BranchNotFoundError(branchId)
    }

    const updated = branch.update(request)
    const saved = await this.branchRepository.save(updated)
    return BranchResponse.fromEntity(saved)
  }

  async deleteBranch(companyId: string, branchId: string): Promise<void> {
    const branch = await this.branchRepository.findById(branchId, companyId)
    if (!branch) {
      throw new BranchNotFoundError(branchId)
    }

    await this.branchRepository.delete(branchId, companyId)
  }

  async listBranches(companyId: string): Promise<BranchResponse[]> {
    const branches = await this.branchRepository.findByCompanyId(companyId)
    return branches.map(BranchResponse.fromEntity)
  }
}
