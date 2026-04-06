import { Injectable, Inject } from '@nestjs/common'
import { IUserRepository } from '../../domain/ports/user-repository.port'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import { LoginRequest, LoginResponse } from '../dtos/login.dto'
import { UserDto } from '../dtos/user.dto'

@Injectable()
export class LoginService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmailAndCompany(
      request.email,
      request.companyId,
    )
    if (!user) {
      throw new UserNotFoundError(request.email)
    }

    // Mock auth: token is the userId itself
    const response = new LoginResponse()
    response.user = UserDto.fromEntity(user)
    response.token = user.id
    return response
  }
}
