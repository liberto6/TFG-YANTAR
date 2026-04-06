import { Inject, Injectable } from '@nestjs/common'
import { ICompanyRepository } from '../../domain/ports/company-repository.port'
import { CompanyNotFoundError } from '../../domain/errors/company-not-found.error'
import { UpdateBrandingRequest } from '../dtos/update-branding.dto'
import { CompanyConfigResponse } from '../dtos/company-config.dto'

@Injectable()
export class UpdateBrandingService {
  constructor(
    @Inject('ICompanyRepository')
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    companyId: string,
    request: UpdateBrandingRequest,
  ): Promise<CompanyConfigResponse> {
    const company = await this.companyRepository.findById(companyId)
    if (!company) {
      throw new CompanyNotFoundError(companyId)
    }

    const updated = company.updateBranding(request)
    const saved = await this.companyRepository.save(updated)

    return CompanyConfigResponse.from({
      name: saved.name,
      slug: saved.slug,
      description: saved.description,
      logoUrl: saved.logoUrl,
      faviconUrl: saved.faviconUrl,
      fontFamily: saved.fontFamily,
      colorPrimary: saved.colorPrimary,
      colorSecondary: saved.colorSecondary,
      colorAccent: saved.colorAccent,
      colorBackground: saved.colorBackground,
      colorSurface: saved.colorSurface,
      colorText: saved.colorText,
      colorTextMuted: saved.colorTextMuted,
      welcomeMessage: saved.welcomeMessage,
      appName: saved.appName,
    })
  }
}
