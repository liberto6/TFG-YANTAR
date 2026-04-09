import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common'
import { GetCompanyConfigService } from '../../application/services/get-company-config.service'
import { GetTimeSlotsService, TimeSlotsResponse } from '../../application/services/get-time-slots.service'
import { GetBranchesService, BranchSummary } from '../../application/services/get-branches.service'
import { CheckDeliveryService, DeliveryCheckResult } from '../../application/services/check-delivery.service'
import { CompanyConfigResponse } from '../../application/dtos/company-config.dto'

class CheckDeliveryBody {
  branchId!: string
  lat!: number
  lng!: number
}

@Controller('companies')
export class CompanyPublicController {
  constructor(
    private readonly getCompanyConfigService: GetCompanyConfigService,
    private readonly getTimeSlotsService: GetTimeSlotsService,
    private readonly getBranchesService: GetBranchesService,
    private readonly checkDeliveryService: CheckDeliveryService,
  ) {}

  @Get(':slug/config')
  async getConfig(@Param('slug') slug: string): Promise<CompanyConfigResponse> {
    return this.getCompanyConfigService.execute(slug)
  }

  @Get(':slug/branches')
  async getBranches(@Param('slug') slug: string): Promise<BranchSummary[]> {
    return this.getBranchesService.execute(slug)
  }

  @Post(':slug/check-delivery')
  async checkDelivery(
    @Param('slug') slug: string,
    @Body() body: CheckDeliveryBody,
  ): Promise<DeliveryCheckResult | null> {
    return this.checkDeliveryService.execute(body.branchId, body.lat, body.lng)
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
