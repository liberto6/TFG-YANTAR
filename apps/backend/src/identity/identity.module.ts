import { Module, forwardRef } from '@nestjs/common'
import { AuthController } from './infrastructure/controllers/auth.controller'
import { GetCurrentUserService } from './application/services/get-current-user.service'
import { RegisterUserService } from './application/services/register-user.service'
import { RegisterBusinessService } from './application/services/register-business.service'
import { UpdateProfileService } from './application/services/update-profile.service'
import { LoginService } from './application/services/login.service'
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository'
import { JwtAuthAdapter } from './infrastructure/adapters/jwt-auth.adapter'
import { BcryptPasswordAdapter } from './infrastructure/adapters/bcrypt-password.adapter'
import { CompanyModule } from '../company/company.module'

@Module({
  imports: [forwardRef(() => CompanyModule)],
  controllers: [AuthController],
  providers: [
    GetCurrentUserService,
    RegisterUserService,
    RegisterBusinessService,
    UpdateProfileService,
    LoginService,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IAuthService',
      useClass: JwtAuthAdapter,
    },
    {
      provide: 'IPasswordService',
      useClass: BcryptPasswordAdapter,
    },
  ],
  exports: [GetCurrentUserService, 'IUserRepository', 'IAuthService'],
})
export class IdentityModule {}
