import { Injectable, Inject } from '@nestjs/common'
import { IRewardRepository } from '../../domain/ports/reward-repository.port'
import { RewardDto } from '../dtos/reward.dto'

@Injectable()
export class GetRewardsService {
  constructor(
    @Inject('IRewardRepository')
    private readonly rewardRepository: IRewardRepository,
  ) {}

  async execute(companyId: string): Promise<RewardDto[]> {
    const rewards = await this.rewardRepository.getAvailable(companyId)
    return rewards.map(RewardDto.fromEntity)
  }
}
