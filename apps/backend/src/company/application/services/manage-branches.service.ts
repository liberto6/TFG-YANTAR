import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Branch } from '../../domain/entities/branch.entity'
import { IBranchRepository } from '../../domain/ports/branch-repository.port'
import { BranchNotFoundError } from '../../domain/errors/branch-not-found.error'
import { SlugAlreadyTakenError } from '../../domain/errors/slug-already-taken.error'
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
    const slug = await this.resolveUniqueSlug(
      companyId,
      request.slug ?? request.name,
    )

    const branch = Branch.create({
      id: randomUUID(),
      companyId,
      slug,
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

    if (request.slug !== undefined) {
      const candidate = Branch.normalizeSlug(request.slug)
      if (candidate !== branch.slug) {
        const collision = await this.branchRepository.findBySlug(
          candidate,
          companyId,
        )
        if (collision && collision.id !== branchId) {
          throw new SlugAlreadyTakenError(candidate)
        }
      }
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

  /**
   * Resuelve un slug único añadiendo sufijo numerico si la base ya existe.
   * Por ejemplo, si "centro" ya existe se intenta "centro-2", "centro-3", etc.
   * Reintentos limitados a 100 para evitar bucles patológicos.
   */
  private async resolveUniqueSlug(
    companyId: string,
    raw: string,
  ): Promise<string> {
    const base = Branch.normalizeSlug(raw)
    if (!base) {
      throw new SlugAlreadyTakenError('(empty)')
    }

    let candidate = base
    let suffix = 2
    while (await this.branchRepository.findBySlug(candidate, companyId)) {
      candidate = `${base}-${suffix}`
      suffix++
      if (suffix > 100) {
        throw new SlugAlreadyTakenError(base)
      }
    }
    return candidate
  }
}
