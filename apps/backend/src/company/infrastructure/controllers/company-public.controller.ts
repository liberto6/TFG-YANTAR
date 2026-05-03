import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common'
import { IsString, IsNotEmpty, IsNumber } from 'class-validator'
import { GetCompanyConfigService } from '../../application/services/get-company-config.service'
import { GetTimeSlotsService, TimeSlotsResponse } from '../../application/services/get-time-slots.service'
import { GetBranchesService, BranchSummary } from '../../application/services/get-branches.service'
import { GetBranchBySlugService } from '../../application/services/get-branch-by-slug.service'
import { ResolveTenantService, TenantResolution } from '../../application/services/resolve-tenant.service'
import { CheckDeliveryService, DeliveryCheckResult } from '../../application/services/check-delivery.service'
import { CompanyConfigResponse } from '../../application/dtos/company-config.dto'
import { BranchResponse } from '../../application/dtos/branch.dto'

class CheckDeliveryBody {
  @IsString()
  @IsNotEmpty()
  branchId!: string

  @IsNumber()
  lat!: number

  @IsNumber()
  lng!: number
}

@Controller('companies')
export class CompanyPublicController {
  constructor(
    private readonly getCompanyConfigService: GetCompanyConfigService,
    private readonly getTimeSlotsService: GetTimeSlotsService,
    private readonly getBranchesService: GetBranchesService,
    private readonly getBranchBySlugService: GetBranchBySlugService,
    private readonly resolveTenantService: ResolveTenantService,
    private readonly checkDeliveryService: CheckDeliveryService,
  ) {}

  // Resolución de host → tenant slug. La usa el middleware Next.js para
  // mapear `napoli.yantar.app` o `pedir.napoli.es` al slug de empresa.
  @Get('resolve')
  async resolveTenant(
    @Query('host') host: string,
  ): Promise<TenantResolution | { slug: null }> {
    const result = await this.resolveTenantService.execute(host ?? '')
    return result ?? { slug: null }
  }

  @Get(':slug/config')
  async getConfig(@Param('slug') slug: string): Promise<CompanyConfigResponse> {
    return this.getCompanyConfigService.execute(slug)
  }

  @Get(':slug/branches')
  async getBranches(@Param('slug') slug: string): Promise<BranchSummary[]> {
    return this.getBranchesService.execute(slug)
  }

  // Resolución de sede por slug. Vive bajo /by-slug/ para no colisionar
  // con `:branchId/slots` (UUIDs vs slugs son indistinguibles a nivel de ruta).
  @Get(':slug/branches/by-slug/:branchSlug')
  async getBranchBySlug(
    @Param('slug') slug: string,
    @Param('branchSlug') branchSlug: string,
  ): Promise<BranchResponse> {
    return this.getBranchBySlugService.execute(slug, branchSlug)
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
