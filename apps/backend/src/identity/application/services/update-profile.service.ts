import { Injectable, Inject } from '@nestjs/common'
import { IUserRepository } from '../../domain/ports/user-repository.port'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import { UserDto } from '../dtos/user.dto'
import { UpdateProfileRequest } from '../dtos/update-profile.dto'

@Injectable()
export class UpdateProfileService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string, request: UpdateProfileRequest): Promise<UserDto> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundError(userId)
    }

    const updated = user.updateProfile(request)
    const saved = await this.userRepository.save(updated)

    return UserDto.fromEntity(saved)
  }
}
