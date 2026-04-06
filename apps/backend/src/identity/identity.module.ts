import { Module, forwardRef } from '@nestjs/common'
import { AuthController } from './infrastructure/controllers/auth.controller'
import { GetCurrentUserService } from './application/services/get-current-user.service'
import { RegisterUserService } from './application/services/register-user.service'
import { RegisterBusinessService } from './application/services/register-business.service'
import { UpdateProfileService } from './application/services/update-profile.service'
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository'
import { MockAuthAdapter } from './infrastructure/adapters/mock-auth.adapter'
import { CompanyModule } from '../company/company.module'

@Module({
  imports: [forwardRef(() => CompanyModule)],
  controllers: [AuthController],
  providers: [
    GetCurrentUserService,
    RegisterUserService,
    RegisterBusinessService,
    UpdateProfileService,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IAuthService',
      useClass: MockAuthAdapter,
    },
  ],
  exports: [GetCurrentUserService, 'IUserRepository', 'IAuthService'],
})
export class IdentityModule {}
