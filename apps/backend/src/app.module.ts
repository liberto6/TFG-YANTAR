import { Module } from '@nestjs/common'
import { IdentityModule } from './identity/identity.module'
import { CompanyModule } from './company/company.module'

@Module({
  imports: [IdentityModule, CompanyModule],
})
export class AppModule {}
