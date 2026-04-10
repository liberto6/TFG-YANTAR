import { Injectable, Inject } from '@nestjs/common'
import { IDeliveryZoneRepository } from '../../domain/ports/delivery-zone-repository.port'
import { AvailabilityService } from '../../domain/services/availability.service'

export interface DeliveryCheckResult {
  zoneId: string
  zoneName: string
  deliveryFee: number
  estimatedTimeMinutes: number
  minOrderAmount: number
}

@Injectable()
export class CheckDeliveryService {
  private readonly availability = new AvailabilityService()

  constructor(
    @Inject('IDeliveryZoneRepository')
    private readonly zoneRepository: IDeliveryZoneRepository,
  ) {}

  async execute(
    branchId: string,
    lat: number,
    lng: number,
  ): Promise<DeliveryCheckResult | null> {
    const zones = await this.zoneRepository.findByBranchId(branchId)

    for (const zone of zones) {
      if (this.availability.isPointInZone(zone, lat, lng)) {
        return {
          zoneId: zone.id,
          zoneName: zone.name,
          deliveryFee: zone.deliveryFee,
          estimatedTimeMinutes: zone.estimatedTimeMinutes,
          minOrderAmount: zone.minOrderAmount,
        }
      }
    }

    return null
  }
}
