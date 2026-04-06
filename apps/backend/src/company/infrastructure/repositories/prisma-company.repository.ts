import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service'
import { Company } from '../../domain/entities/company.entity'
import { ICompanyRepository } from '../../domain/ports/company-repository.port'

@Injectable()
export class PrismaCompanyRepository implements ICompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { slug } })
    return record ? this.toDomain(record) : null
  }

  async findByDomain(domain: string): Promise<Company | null> {
    const record = await this.prisma.company.findUnique({ where: { domain } })
    return record ? this.toDomain(record) : null
  }

  async findByOwnerId(ownerId: string): Promise<Company | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { companyId: true },
    })
    if (!user?.companyId) return null
    return this.findById(user.companyId)
  }

  async save(company: Company): Promise<Company> {
    const data = this.toPrisma(company)
    const record = await this.prisma.company.upsert({
      where: { id: company.id },
      create: data,
      update: data,
    })
    return this.toDomain(record)
  }

  private toDomain(record: {
    id: string
    name: string
    slug: string
    description: string | null
    domain: string | null
    logoUrl: string | null
    faviconUrl: string | null
    fontFamily: string | null
    colorPrimary: string | null
    colorSecondary: string | null
    colorAccent: string | null
    colorBackground: string | null
    colorSurface: string | null
    colorText: string | null
    colorTextMuted: string | null
    welcomeMessage: string | null
    appName: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }): Company {
    return Company.restore({
      id: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description,
      domain: record.domain,
      logoUrl: record.logoUrl,
      faviconUrl: record.faviconUrl,
      fontFamily: record.fontFamily,
      colorPrimary: record.colorPrimary,
      colorSecondary: record.colorSecondary,
      colorAccent: record.colorAccent,
      colorBackground: record.colorBackground,
      colorSurface: record.colorSurface,
      colorText: record.colorText,
      colorTextMuted: record.colorTextMuted,
      welcomeMessage: record.welcomeMessage,
      appName: record.appName,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
  }

  private toPrisma(company: Company) {
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      description: company.description,
      domain: company.domain,
      logoUrl: company.logoUrl,
      faviconUrl: company.faviconUrl,
      fontFamily: company.fontFamily,
      colorPrimary: company.colorPrimary,
      colorSecondary: company.colorSecondary,
      colorAccent: company.colorAccent,
      colorBackground: company.colorBackground,
      colorSurface: company.colorSurface,
      colorText: company.colorText,
      colorTextMuted: company.colorTextMuted,
      welcomeMessage: company.welcomeMessage,
      appName: company.appName,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    }
  }
}
