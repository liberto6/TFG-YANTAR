import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { OperatingHour } from '../../domain/value-objects/operating-hour.vo'
import { IOperatingHourRepository } from '../../domain/ports/operating-hour-repository.port'

@Injectable()
export class PrismaOperatingHourRepository implements IOperatingHourRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBranchId(branchId: string): Promise<OperatingHour[]> {
    const records = await this.prisma.operatingHour.findMany({
      where: { branchId },
    })
    return records.map((r) => this.toDomain(r))
  }

  async replaceForBranch(
    branchId: string,
    hours: OperatingHour[],
  ): Promise<OperatingHour[]> {
    const created = await this.prisma.$transaction(async (tx) => {
      await tx.operatingHour.deleteMany({ where: { branchId } })
      const results: Array<{
        id: string
        branchId: string
        dayOfWeek: number
        openTime: string
        closeTime: string
        isClosed: boolean
      }> = []
      for (const hour of hours) {
        const record = await tx.operatingHour.create({
          data: {
            id: hour.id,
            branchId,
            dayOfWeek: hour.dayOfWeek,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isClosed: hour.isClosed,
          },
        })
        results.push(record)
      }
      return results
    })
    return created.map((r) => this.toDomain(r))
  }

  private toDomain(record: {
    id: string
    branchId: string
    dayOfWeek: number
    openTime: string
    closeTime: string
    isClosed: boolean
  }): OperatingHour {
    return OperatingHour.restore({
      id: record.id,
      branchId: record.branchId,
      dayOfWeek: record.dayOfWeek,
      openTime: record.openTime,
      closeTime: record.closeTime,
      isClosed: record.isClosed,
    })
  }
}
