import { OperatingHour } from '../value-objects/operating-hour.vo'

export interface IOperatingHourRepository {
  findByBranchId(branchId: string): Promise<OperatingHour[]>
  replaceForBranch(
    branchId: string,
    hours: OperatingHour[],
  ): Promise<OperatingHour[]>
}
