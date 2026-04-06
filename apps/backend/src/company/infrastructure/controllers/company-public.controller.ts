import { Controller, Get, Param } from '@nestjs/common'
import { GetCompanyConfigService } from '../../application/services/get-company-config.service'
import { CompanyConfigResponse } from '../../application/dtos/company-config.dto'

@Controller('companies')
export class CompanyPublicController {
  constructor(
    private readonly getCompanyConfigService: GetCompanyConfigService,
  ) {}

  @Get(':slug/config')
  async getConfig(
    @Param('slug') slug: string,
  ): Promise<CompanyConfigResponse> {
    return this.getCompanyConfigService.execute(slug)
  }
}
