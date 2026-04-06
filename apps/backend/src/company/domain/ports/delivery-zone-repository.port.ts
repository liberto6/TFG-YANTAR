import { DeliveryZone } from '../entities/delivery-zone.entity'

export interface IDeliveryZoneRepository {
  findById(id: string): Promise<DeliveryZone | null>
  findByBranchId(branchId: string): Promise<DeliveryZone[]>
  findByCompanyId(companyId: string): Promise<DeliveryZone[]>
  findByPostalCode(
    companyId: string,
    postalCode: string,
  ): Promise<DeliveryZone | null>
  save(zone: DeliveryZone): Promise<DeliveryZone>
  delete(id: string): Promise<void>
}
