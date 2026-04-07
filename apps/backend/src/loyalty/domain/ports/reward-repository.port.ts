import { Reward } from '../entities/reward.entity'

export interface IRewardRepository {
  getAvailable(companyId: string): Promise<Reward[]>
  getById(rewardId: string, companyId: string): Promise<Reward | null>
  update(reward: Reward): Promise<Reward>
  create(reward: Reward): Promise<Reward>
  delete(rewardId: string, companyId: string): Promise<void>
}
