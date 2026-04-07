export interface ILoyaltyChecker {
  getAvailablePoints(customerId: string, companyId: string): Promise<number>
  redeemPoints(customerId: string, companyId: string, points: number): Promise<void>
  awardPoints(customerId: string, companyId: string, orderTotal: number, orderId: string): Promise<number>
}
