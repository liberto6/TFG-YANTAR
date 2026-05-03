import { Module, forwardRef } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module'
import { CompanyPublicController } from './infrastructure/controllers/company-public.controller'
import { CompanyAdminController } from './infrastructure/controllers/company-admin.controller'
import { CreateCompanyService } from './application/services/create-company.service'
import { GetCompanyConfigService } from './application/services/get-company-config.service'
import { UpdateBrandingService } from './application/services/update-branding.service'
import { ManageBranchesService } from './application/services/manage-branches.service'
import { ManageOperatingHoursService } from './application/services/manage-operating-hours.service'
import { ManageDeliveryZonesService } from './application/services/manage-delivery-zones.service'
import { GetTimeSlotsService } from './application/services/get-time-slots.service'
import { GetBranchesService } from './application/services/get-branches.service'
import { GetBranchBySlugService } from './application/services/get-branch-by-slug.service'
import { ResolveTenantService } from './application/services/resolve-tenant.service'
import { CheckDeliveryService } from './application/services/check-delivery.service'
import { PrismaCompanyRepository } from './infrastructure/repositories/prisma-company.repository'
import { PrismaBranchRepository } from './infrastructure/repositories/prisma-branch.repository'
import { PrismaDeliveryZoneRepository } from './infrastructure/repositories/prisma-delivery-zone.repository'
import { PrismaOperatingHourRepository } from './infrastructure/repositories/prisma-operating-hour.repository'
import { AdminGuard } from '../shared/infrastructure/guards/admin.guard'

@Module({
  imports: [forwardRef(() => IdentityModule)],
  controllers: [CompanyPublicController, CompanyAdminController],
  providers: [
    CreateCompanyService,
    GetCompanyConfigService,
    UpdateBrandingService,
    ManageBranchesService,
    ManageOperatingHoursService,
    ManageDeliveryZonesService,
    GetTimeSlotsService,
    GetBranchesService,
    GetBranchBySlugService,
    ResolveTenantService,
    CheckDeliveryService,
    {
      provide: 'YANTAR_ROOT_DOMAIN',
      useFactory: () => process.env.YANTAR_ROOT_DOMAIN ?? 'yantar.app',
    },
    {
      provide: 'ICompanyRepository',
      useClass: PrismaCompanyRepository,
    },
    {
      provide: 'IBranchRepository',
      useClass: PrismaBranchRepository,
    },
    {
      provide: 'IDeliveryZoneRepository',
      useClass: PrismaDeliveryZoneRepository,
    },
    {
      provide: 'IOperatingHourRepository',
      useClass: PrismaOperatingHourRepository,
    },
    AdminGuard,
  ],
  exports: ['ICompanyRepository'],
})
export class CompanyModule {}
