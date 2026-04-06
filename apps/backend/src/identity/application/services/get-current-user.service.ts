import { Injectable, Inject } from '@nestjs/common'
import { User } from '../../domain/entities/user.entity'
import { IUserRepository } from '../../domain/ports/user-repository.port'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'

@Injectable()
export class GetCurrentUserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundError(userId)
    }
    return user
  }
}
