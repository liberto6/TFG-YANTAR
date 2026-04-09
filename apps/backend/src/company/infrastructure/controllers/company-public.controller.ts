import { Controller, Get, Param, Query } from '@nestjs/common'
import { GetCompanyConfigService } from '../../application/services/get-company-config.service'
import { GetTimeSlotsService, TimeSlotsResponse } from '../../application/services/get-time-slots.service'
import { CompanyConfigResponse } from '../../application/dtos/company-config.dto'

@Controller('companies')
export class CompanyPublicController {
  constructor(
    private readonly getCompanyConfigService: GetCompanyConfigService,
    private readonly getTimeSlotsService: GetTimeSlotsService,
  ) {}

  @Get(':slug/config')
  async getConfig(@Param('slug') slug: string): Promise<CompanyConfigResponse> {
    return this.getCompanyConfigService.execute(slug)
  }

  @Get(':slug/branches/:branchId/slots')
  async getTimeSlots(
    @Param('slug') slug: string,
    @Param('branchId') branchId: string,
    @Query('date') date?: string,
  ): Promise<TimeSlotsResponse> {
    const config = await this.getCompanyConfigService.execute(slug)
    return this.getTimeSlotsService.execute({ companyId: config.id, branchId, date })
  }
}
