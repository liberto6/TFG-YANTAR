import { LoyaltyAccount } from '../entities/loyalty-account.entity'

export interface ILoyaltyAccountRepository {
  getByCustomer(customerId: string, companyId: string): Promise<LoyaltyAccount | null>
  getOrCreate(customerId: string, companyId: string, newId: string): Promise<LoyaltyAccount>
  save(account: LoyaltyAccount): Promise<void>
}
