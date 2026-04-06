import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { IOperatingHourRepository } from '../../domain/ports/operating-hour-repository.port'
import { IBranchRepository } from '../../domain/ports/branch-repository.port'
import { BranchNotFoundError } from '../../domain/errors/branch-not-found.error'
import { OperatingHour } from '../../domain/value-objects/operating-hour.vo'
import {
  SetOperatingHoursRequest,
  OperatingHourResponse,
} from '../dtos/operating-hours.dto'

@Injectable()
export class ManageOperatingHoursService {
  constructor(
    @Inject('IOperatingHourRepository')
    private readonly operatingHourRepository: IOperatingHourRepository,
    @Inject('IBranchRepository')
    private readonly branchRepository: IBranchRepository,
  ) {}

  async setHours(
    companyId: string,
    branchId: string,
    request: SetOperatingHoursRequest,
  ): Promise<OperatingHourResponse[]> {
    await this.ensureBranchBelongsToCompany(branchId, companyId)

    const hours = request.hours.map((h) =>
      OperatingHour.create({
        id: randomUUID(),
        branchId,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      }),
    )

    const saved = await this.operatingHourRepository.replaceForBranch(
      branchId,
      hours,
    )
    return saved.map(OperatingHourResponse.fromEntity)
  }

  async getHours(
    companyId: string,
    branchId: string,
  ): Promise<OperatingHourResponse[]> {
    await this.ensureBranchBelongsToCompany(branchId, companyId)

    const hours = await this.operatingHourRepository.findByBranchId(branchId)
    return hours.map(OperatingHourResponse.fromEntity)
  }

  private async ensureBranchBelongsToCompany(
    branchId: string,
    companyId: string,
  ): Promise<void> {
    const branch = await this.branchRepository.findById(branchId, companyId)
    if (!branch) {
      throw new BranchNotFoundError(branchId)
    }
  }
}
