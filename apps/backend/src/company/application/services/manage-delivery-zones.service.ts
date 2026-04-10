import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { DeliveryZone } from '../../domain/entities/delivery-zone.entity'
import { IDeliveryZoneRepository } from '../../domain/ports/delivery-zone-repository.port'
import { DeliveryZoneNotFoundError } from '../../domain/errors/delivery-zone-not-found.error'
import {
  CreateDeliveryZoneRequest,
  UpdateDeliveryZoneRequest,
  UpdateZonePolygonRequest,
  DeliveryZoneResponse,
} from '../dtos/delivery-zone.dto'
import { GeoPolygon } from '../../domain/entities/delivery-zone.entity'

@Injectable()
export class ManageDeliveryZonesService {
  constructor(
    @Inject('IDeliveryZoneRepository')
    private readonly deliveryZoneRepository: IDeliveryZoneRepository,
  ) {}

  async createZone(
    companyId: string,
    branchId: string,
    request: CreateDeliveryZoneRequest,
  ): Promise<DeliveryZoneResponse> {
    const zone = DeliveryZone.create({
      id: randomUUID(),
      branchId,
      companyId,
      name: request.name,
      postalCodes: request.postalCodes,
      minOrderAmount: request.minOrderAmount,
      deliveryFee: request.deliveryFee,
      estimatedTimeMinutes: request.estimatedTimeMinutes,
    })

    const saved = await this.deliveryZoneRepository.save(zone)
    return DeliveryZoneResponse.fromEntity(saved)
  }

  async updateZone(
    companyId: string,
    zoneId: string,
    request: UpdateDeliveryZoneRequest,
  ): Promise<DeliveryZoneResponse> {
    const zone = await this.deliveryZoneRepository.findById(zoneId)
    if (!zone || zone.companyId !== companyId) {
      throw new DeliveryZoneNotFoundError(zoneId)
    }

    const updated = zone.update(request)
    const saved = await this.deliveryZoneRepository.save(updated)
    return DeliveryZoneResponse.fromEntity(saved)
  }

  async deleteZone(companyId: string, zoneId: string): Promise<void> {
    const zone = await this.deliveryZoneRepository.findById(zoneId)
    if (!zone || zone.companyId !== companyId) {
      throw new DeliveryZoneNotFoundError(zoneId)
    }

    await this.deliveryZoneRepository.delete(zoneId)
  }

  async updateZonePolygon(
    companyId: string,
    zoneId: string,
    request: UpdateZonePolygonRequest,
  ): Promise<DeliveryZoneResponse> {
    const zone = await this.deliveryZoneRepository.findById(zoneId)
    if (!zone || zone.companyId !== companyId) {
      throw new DeliveryZoneNotFoundError(zoneId)
    }
    const updated = zone.withPolygon((request.polygon as GeoPolygon) ?? null)
    const saved = await this.deliveryZoneRepository.save(updated)
    return DeliveryZoneResponse.fromEntity(saved)
  }

  async listZones(branchId: string): Promise<DeliveryZoneResponse[]> {
    const zones = await this.deliveryZoneRepository.findByBranchId(branchId)
    return zones.map(DeliveryZoneResponse.fromEntity)
  }
}
