import { Module } from '@nestjs/common'
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module'
import { IdentityModule } from './identity/identity.module'
import { CompanyModule } from './company/company.module'
import { MenuModule } from './menu/menu.module'
import { AllergenModule } from './allergen/allergen.module'
import { OrderModule } from './order/order.module'

@Module({
  imports: [PrismaModule, IdentityModule, CompanyModule, MenuModule, AllergenModule, OrderModule],
})
export class AppModule {}
