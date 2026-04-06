import { Module } from '@nestjs/common'
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module'
import { IdentityModule } from './identity/identity.module'
import { CompanyModule } from './company/company.module'

@Module({
  imports: [PrismaModule, IdentityModule, CompanyModule],
})
export class AppModule {}
