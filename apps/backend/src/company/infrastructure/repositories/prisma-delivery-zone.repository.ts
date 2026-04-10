import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { DeliveryZone } from '../../domain/entities/delivery-zone.entity'
import { IDeliveryZoneRepository } from '../../domain/ports/delivery-zone-repository.port'

@Injectable()
export class PrismaDeliveryZoneRepository implements IDeliveryZoneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DeliveryZone | null> {
    const record = await this.prisma.deliveryZone.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findByBranchId(branchId: string): Promise<DeliveryZone[]> {
    const records = await this.prisma.deliveryZone.findMany({
      where: { branchId },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findByCompanyId(companyId: string): Promise<DeliveryZone[]> {
    const records = await this.prisma.deliveryZone.findMany({
      where: { companyId },
    })
    return records.map((r) => this.toDomain(r))
  }

  async findByPostalCode(
    companyId: string,
    postalCode: string,
  ): Promise<DeliveryZone | null> {
    const record = await this.prisma.deliveryZone.findFirst({
      where: { companyId, postalCodes: { has: postalCode } },
    })
    return record ? this.toDomain(record) : null
  }

  async save(zone: DeliveryZone): Promise<DeliveryZone> {
    const data = this.toPrisma(zone)
    const record = await this.prisma.deliveryZone.upsert({
      where: { id: zone.id },
      create: data,
      update: data,
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliveryZone.delete({ where: { id } })
  }

  private toDomain(record: {
    id: string
    branchId: string
    companyId: string
    name: string
    postalCodes: string[]
    minOrderAmount: number
    deliveryFee: number
    estimatedTimeMinutes: number
    isActive: boolean
    polygon?: unknown
  }): DeliveryZone {
    return DeliveryZone.restore({
      id: record.id,
      branchId: record.branchId,
      companyId: record.companyId,
      name: record.name,
      postalCodes: record.postalCodes,
      minOrderAmount: record.minOrderAmount,
      deliveryFee: record.deliveryFee,
      estimatedTimeMinutes: record.estimatedTimeMinutes,
      isActive: record.isActive,
      polygon: (record.polygon as any) ?? null,
    })
  }

  private toPrisma(zone: DeliveryZone) {
    return {
      id: zone.id,
      branchId: zone.branchId,
      companyId: zone.companyId,
      name: zone.name,
      postalCodes: zone.postalCodes,
      minOrderAmount: zone.minOrderAmount,
      deliveryFee: zone.deliveryFee,
      estimatedTimeMinutes: zone.estimatedTimeMinutes,
      isActive: zone.isActive,
      polygon: zone.polygon ? JSON.parse(JSON.stringify(zone.polygon)) : undefined,
    }
  }
}
