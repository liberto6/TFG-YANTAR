import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Company } from '../../domain/entities/company.entity'
import { ICompanyRepository } from '../../domain/ports/company-repository.port'
import {
  CreateCompanyRequest,
  CreateCompanyResponse,
} from '../dtos/create-company.dto'

@Injectable()
export class CreateCompanyService {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(request: CreateCompanyRequest): Promise<CreateCompanyResponse> {
    const company = Company.create({ id: randomUUID(), name: request.name })

    let slug = company.slug
    let suffix = 0
    while (await this.companyRepository.findBySlug(slug)) {
      suffix++
      slug = `${company.slug}-${suffix}`
    }

    const toSave =
      slug !== company.slug
        ? Company.restore({
            id: company.id,
            name: company.name,
            slug,
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
          })
        : company

    const saved = await this.companyRepository.save(toSave)

    return CreateCompanyResponse.from({
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
    })
  }
}
