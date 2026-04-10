import { Injectable, Inject } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ILoyaltyAccountRepository } from '../../domain/ports/loyalty-account-repository.port'
import { LoyaltyAccountDto } from '../dtos/loyalty-account.dto'

@Injectable()
export class GetBalanceService {
  constructor(
    @Inject('ILoyaltyAccountRepository')
    private readonly accountRepository: ILoyaltyAccountRepository,
  ) {}

  async execute(customerId: string, companyId: string): Promise<LoyaltyAccountDto> {
    const account = await this.accountRepository.getOrCreate(
      customerId,
      companyId,
      randomUUID(),
    )
    return LoyaltyAccountDto.fromEntity(account)
  }
}
