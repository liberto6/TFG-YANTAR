import { Module } from '@nestjs/common'
import { AuthController } from './infrastructure/controllers/auth.controller'
import { GetCurrentUserService } from './application/services/get-current-user.service'

@Module({
  controllers: [AuthController],
  providers: [
    GetCurrentUserService,
    // TODO: Replace with real repository implementation
    {
      provide: 'IUserRepository',
      useValue: {
        findById: async () => null,
        findByEmail: async () => null,
        save: async (user: any) => user,
      },
    },
  ],
  exports: [GetCurrentUserService],
})
export class IdentityModule {}
