import { Injectable, Inject } from '@nestjs/common'
import { IBranchRepository } from '../../domain/ports/branch-repository.port'
import { IOperatingHourRepository } from '../../domain/ports/operating-hour-repository.port'
import { AvailabilityService } from '../../domain/services/availability.service'
import { BranchNotFoundError } from '../../domain/errors/branch-not-found.error'

export interface TimeSlot {
  label: string
  value: string
}

export interface TimeSlotsResponse {
  date: string
  slots: TimeSlot[]
}

@Injectable()
export class GetTimeSlotsService {
  private readonly availability = new AvailabilityService()

  constructor(
    @Inject('IBranchRepository')
    private readonly branchRepository: IBranchRepository,
    @Inject('IOperatingHourRepository')
    private readonly hoursRepository: IOperatingHourRepository,
  ) {}

  async execute(params: {
    companyId: string
    branchId: string
    date?: string
    now?: Date
  }): Promise<TimeSlotsResponse> {
    const { companyId, branchId } = params
    const now = params.now ?? new Date()
    const dateStr = params.date ?? now.toISOString().slice(0, 10)

    const branch = await this.branchRepository.findById(branchId, companyId)
    if (!branch) throw new BranchNotFoundError(branchId)

    const hours = await this.hoursRepository.findByBranchId(branchId)

    const [year, month, day] = dateStr.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day, 0, 0, 0)

    const slots = this.availability.generateTimeSlots(hours, targetDate, now, 30)

    return { date: dateStr, slots }
  }
}
