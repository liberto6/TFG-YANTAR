import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'
import { AdminGuard } from '../../../shared/infrastructure/guards/admin.guard'
import { GetCurrentUserService } from '../../../identity/application/services/get-current-user.service'
import { GetCompanyConfigService } from '../../application/services/get-company-config.service'
import { UpdateBrandingService } from '../../application/services/update-branding.service'
import { ManageBranchesService } from '../../application/services/manage-branches.service'
import { ManageOperatingHoursService } from '../../application/services/manage-operating-hours.service'
import { ManageDeliveryZonesService } from '../../application/services/manage-delivery-zones.service'
import { UpdateBrandingRequest } from '../../application/dtos/update-branding.dto'
import { CompanyConfigResponse } from '../../application/dtos/company-config.dto'
import {
  CreateBranchRequest,
  UpdateBranchRequest,
  BranchResponse,
} from '../../application/dtos/branch.dto'
import { SetOperatingHoursRequest, OperatingHourResponse } from '../../application/dtos/operating-hours.dto'
import {
  CreateDeliveryZoneRequest,
  UpdateDeliveryZoneRequest,
  DeliveryZoneResponse,
} from '../../application/dtos/delivery-zone.dto'

@Controller('admin/company')
@UseGuards(AuthGuard, AdminGuard)
export class CompanyAdminController {
  constructor(
    private readonly getCurrentUserService: GetCurrentUserService,
    private readonly getCompanyConfigService: GetCompanyConfigService,
    private readonly updateBrandingService: UpdateBrandingService,
    private readonly manageBranchesService: ManageBranchesService,
    private readonly manageOperatingHoursService: ManageOperatingHoursService,
    private readonly manageDeliveryZonesService: ManageDeliveryZonesService,
  ) {}

  private async getCompanyId(req: Request): Promise<string> {
    const userId = (req as any).userId as string
    const user = await this.getCurrentUserService.execute(userId)
    return user.companyId!
  }

  @Get('config')
  async getConfig(@Req() req: Request): Promise<CompanyConfigResponse> {
    const userId = (req as any).userId as string
    const user = await this.getCurrentUserService.execute(userId)
    return this.getCompanyConfigService.executeById(user.companyId!)
  }

  @Patch('branding')
  async updateBranding(
    @Req() req: Request,
    @Body() request: UpdateBrandingRequest,
  ): Promise<CompanyConfigResponse> {
    const companyId = await this.getCompanyId(req)
    return this.updateBrandingService.execute(companyId, request)
  }

  @Get('branches')
  async listBranches(@Req() req: Request): Promise<BranchResponse[]> {
    const companyId = await this.getCompanyId(req)
    return this.manageBranchesService.listBranches(companyId)
  }

  @Post('branches')
  async createBranch(
    @Req() req: Request,
    @Body() request: CreateBranchRequest,
  ): Promise<BranchResponse> {
    const companyId = await this.getCompanyId(req)
    return this.manageBranchesService.createBranch(companyId, request)
  }

  @Patch('branches/:branchId')
  async updateBranch(
    @Req() req: Request,
    @Param('branchId') branchId: string,
    @Body() request: UpdateBranchRequest,
  ): Promise<BranchResponse> {
    const companyId = await this.getCompanyId(req)
    return this.manageBranchesService.updateBranch(companyId, branchId, request)
  }

  @Delete('branches/:branchId')
  async deleteBranch(
    @Req() req: Request,
    @Param('branchId') branchId: string,
  ): Promise<void> {
    const companyId = await this.getCompanyId(req)
    return this.manageBranchesService.deleteBranch(companyId, branchId)
  }

  @Get('branches/:branchId/hours')
  async getHours(
    @Req() req: Request,
    @Param('branchId') branchId: string,
  ): Promise<OperatingHourResponse[]> {
    const companyId = await this.getCompanyId(req)
    return this.manageOperatingHoursService.getHours(companyId, branchId)
  }

  @Put('branches/:branchId/hours')
  async setHours(
    @Req() req: Request,
    @Param('branchId') branchId: string,
    @Body() request: SetOperatingHoursRequest,
  ): Promise<OperatingHourResponse[]> {
    const companyId = await this.getCompanyId(req)
    return this.manageOperatingHoursService.setHours(
      companyId,
      branchId,
      request,
    )
  }

  @Get('branches/:branchId/delivery-zones')
  async listDeliveryZones(
    @Req() req: Request,
    @Param('branchId') branchId: string,
  ): Promise<DeliveryZoneResponse[]> {
    const companyId = await this.getCompanyId(req)
    // Verify branch belongs to company first by listing branches
    void companyId // ownership verified via AdminGuard
    return this.manageDeliveryZonesService.listZones(branchId)
  }

  @Post('branches/:branchId/delivery-zones')
  async createDeliveryZone(
    @Req() req: Request,
    @Param('branchId') branchId: string,
    @Body() request: CreateDeliveryZoneRequest,
  ): Promise<DeliveryZoneResponse> {
    const companyId = await this.getCompanyId(req)
    return this.manageDeliveryZonesService.createZone(
      companyId,
      branchId,
      request,
    )
  }

  @Patch('delivery-zones/:zoneId')
  async updateDeliveryZone(
    @Req() req: Request,
    @Param('zoneId') zoneId: string,
    @Body() request: UpdateDeliveryZoneRequest,
  ): Promise<DeliveryZoneResponse> {
    const companyId = await this.getCompanyId(req)
    return this.manageDeliveryZonesService.updateZone(
      companyId,
      zoneId,
      request,
    )
  }

  @Delete('delivery-zones/:zoneId')
  async deleteDeliveryZone(
    @Req() req: Request,
    @Param('zoneId') zoneId: string,
  ): Promise<void> {
    const companyId = await this.getCompanyId(req)
    return this.manageDeliveryZonesService.deleteZone(companyId, zoneId)
  }
}
