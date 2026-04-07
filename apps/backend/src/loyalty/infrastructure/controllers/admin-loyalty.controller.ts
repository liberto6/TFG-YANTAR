import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { randomUUID } from 'crypto'
import { RewardType } from '@yantar/shared'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'
import { AdminGuard } from '../../../shared/infrastructure/guards/admin.guard'
import { GetCurrentUserService } from '../../../identity/application/services/get-current-user.service'
import { GetRewardsService } from '../../application/services/get-rewards.service'
import { IRewardRepository } from '../../domain/ports/reward-repository.port'
import { ILoyaltyConfigRepository } from '../../domain/ports/loyalty-config-repository.port'
import { Reward } from '../../domain/entities/reward.entity'
import { RewardDto, CreateRewardRequest, UpdateRewardRequest } from '../../application/dtos/reward.dto'
import { LoyaltyRules } from '../../domain/ports/loyalty-config-repository.port'
import { Inject } from '@nestjs/common'

@Controller('admin/loyalty')
@UseGuards(AuthGuard, AdminGuard)
export class AdminLoyaltyController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserService,
    private readonly getRewardsService: GetRewardsService,
    @Inject('IRewardRepository')
    private readonly rewardRepository: IRewardRepository,
    @Inject('ILoyaltyConfigRepository')
    private readonly configRepository: ILoyaltyConfigRepository,
  ) {}

  @Get('config')
  async getConfig(@Req() req: Request): Promise<LoyaltyRules | null> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    return this.configRepository.getByCompany(user.companyId!)
  }

  @Put('config')
  async updateConfig(
    @Req() req: Request,
    @Body() body: Partial<LoyaltyRules>,
  ): Promise<LoyaltyRules> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    return this.configRepository.upsert(user.companyId!, body)
  }

  @Get('rewards')
  async getRewards(@Req() req: Request): Promise<RewardDto[]> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    return this.getRewardsService.execute(user.companyId!)
  }

  @Post('rewards')
  async createReward(
    @Req() req: Request,
    @Body() body: CreateRewardRequest,
  ): Promise<RewardDto> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    const reward = await this.rewardRepository.create(
      new Reward({
        id: randomUUID(),
        companyId: user.companyId!,
        name: body.name,
        description: body.description,
        type: body.type as RewardType,
        pointsCost: body.pointsCost,
        value: body.value,
        isActive: body.isActive ?? true,
        stock: body.stock ?? null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      }),
    )
    return RewardDto.fromEntity(reward)
  }

  @Put('rewards/:rewardId')
  async updateReward(
    @Req() req: Request,
    @Param('rewardId') rewardId: string,
    @Body() body: UpdateRewardRequest,
  ): Promise<RewardDto> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    const reward = await this.rewardRepository.getById(rewardId, user.companyId!)
    if (!reward) throw new Error('Reward not found')
    if (body.name !== undefined) reward.name = body.name
    if (body.description !== undefined) reward.description = body.description
    if (body.pointsCost !== undefined) reward.pointsCost = body.pointsCost
    if (body.isActive !== undefined) reward.isActive = body.isActive
    if (body.stock !== undefined) reward.stock = body.stock
    const updated = await this.rewardRepository.update(reward)
    return RewardDto.fromEntity(updated)
  }

  @Delete('rewards/:rewardId')
  async deleteReward(
    @Req() req: Request,
    @Param('rewardId') rewardId: string,
  ): Promise<void> {
    const user = await this.getCurrentUser.execute((req as any).userId)
    await this.rewardRepository.delete(rewardId, user.companyId!)
  }
}
