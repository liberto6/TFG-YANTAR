export interface LoyaltyRules {
  pointsPerEuro: number
  pointValueCents: number
  minRedeemPoints: number
  isEnabled: boolean
}

export interface ILoyaltyConfigRepository {
  getByCompany(companyId: string): Promise<LoyaltyRules | null>
  upsert(companyId: string, rules: Partial<LoyaltyRules>): Promise<LoyaltyRules>
}
