import { Module, forwardRef } from '@nestjs/common'
import { IdentityModule } from '../identity/identity.module'
import { LoyaltyController } from './infrastructure/controllers/loyalty.controller'
import { AdminLoyaltyController } from './infrastructure/controllers/admin-loyalty.controller'
import { GetBalanceService } from './application/services/get-balance.service'
import { AwardPointsService } from './application/services/award-points.service'
import { RedeemPointsService } from './application/services/redeem-points.service'
import { GetRewardsService } from './application/services/get-rewards.service'
import { GetPointsHistoryService } from './application/services/get-points-history.service'
import { PrismaLoyaltyAccountRepository } from './infrastructure/repositories/prisma-loyalty-account.repository'
import { PrismaPointsTransactionRepository } from './infrastructure/repositories/prisma-points-transaction.repository'
import { PrismaRewardRepository } from './infrastructure/repositories/prisma-reward.repository'
import { PrismaLoyaltyConfigRepository } from './infrastructure/repositories/prisma-loyalty-config.repository'
import { LoyaltyCheckerAdapter } from './infrastructure/adapters/loyalty-checker.adapter'
import { AdminGuard } from '../shared/infrastructure/guards/admin.guard'

@Module({
  imports: [forwardRef(() => IdentityModule)],
  controllers: [LoyaltyController, AdminLoyaltyController],
  providers: [
    GetBalanceService,
    AwardPointsService,
    RedeemPointsService,
    GetRewardsService,
    GetPointsHistoryService,
    LoyaltyCheckerAdapter,
    AdminGuard,
    {
      provide: 'ILoyaltyAccountRepository',
      useClass: PrismaLoyaltyAccountRepository,
    },
    {
      provide: 'IPointsTransactionRepository',
      useClass: PrismaPointsTransactionRepository,
    },
    {
      provide: 'IRewardRepository',
      useClass: PrismaRewardRepository,
    },
    {
      provide: 'ILoyaltyConfigRepository',
      useClass: PrismaLoyaltyConfigRepository,
    },
    {
      provide: 'ILoyaltyChecker',
      useClass: LoyaltyCheckerAdapter,
    },
  ],
  exports: [
    'ILoyaltyChecker',
    GetBalanceService,
    AwardPointsService,
    RedeemPointsService,
    GetRewardsService,
    'IRewardRepository',
    'ILoyaltyConfigRepository',
  ],
})
export class LoyaltyModule {}
