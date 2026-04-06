import { Injectable } from '@nestjs/common'
import { ServiceMode } from '@yantar/shared'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { Branch } from '../../domain/entities/branch.entity'
import { IBranchRepository } from '../../domain/ports/branch-repository.port'

@Injectable()
export class PrismaBranchRepository implements IBranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, companyId: string): Promise<Branch | null> {
    const record = await this.prisma.branch.findFirst({
      where: { id, companyId },
      include: { operatingHours: true },
    })
    return record ? this.toDomain(record) : null
  }

  async findByCompanyId(companyId: string): Promise<Branch[]> {
    const records = await this.prisma.branch.findMany({
      where: { companyId },
      include: { operatingHours: true },
    })
    return records.map((r) => this.toDomain(r))
  }

  async save(branch: Branch): Promise<Branch> {
    const data = this.toPrisma(branch)
    const record = await this.prisma.branch.upsert({
      where: { id: branch.id },
      create: data,
      update: data,
      include: { operatingHours: true },
    })
    return this.toDomain(record)
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this.prisma.branch.deleteMany({
      where: { id, companyId },
    })
  }

  private toDomain(record: {
    id: string
    companyId: string
    name: string
    address: string
    phone: string | null
    email: string | null
    latitude: number | null
    longitude: number | null
    serviceModes: string[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }): Branch {
    return Branch.restore({
      id: record.id,
      companyId: record.companyId,
      name: record.name,
      address: record.address,
      phone: record.phone,
      email: record.email,
      latitude: record.latitude,
      longitude: record.longitude,
      serviceModes: record.serviceModes as ServiceMode[],
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }

  private toPrisma(branch: Branch) {
    return {
      id: branch.id,
      companyId: branch.companyId,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      latitude: branch.latitude,
      longitude: branch.longitude,
      serviceModes: branch.serviceModes,
      isActive: branch.isActive,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    }
  }
}
