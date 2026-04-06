import { Inject, Injectable } from '@nestjs/common'
import { ICompanyRepository } from '../../domain/ports/company-repository.port'
import { CompanyNotFoundError } from '../../domain/errors/company-not-found.error'
import { CompanyConfigResponse } from '../dtos/company-config.dto'

@Injectable()
export class GetCompanyConfigService {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(slug: string): Promise<CompanyConfigResponse> {
    const company = await this.companyRepository.findBySlug(slug)
    if (!company) {
      throw new CompanyNotFoundError(slug)
    }

    return CompanyConfigResponse.from({
      name: company.name,
      slug: company.slug,
      description: company.description,
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
    })
  }
}
