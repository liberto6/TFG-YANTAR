import { Injectable, Inject } from '@nestjs/common'
import { IUserRepository } from '../../domain/ports/user-repository.port'
import { IAuthService } from '../../domain/ports/auth-service.port'
import { User } from '../../domain/entities/user.entity'
import { EmailAlreadyInUseError } from '../../domain/errors/email-already-in-use.error'
import { RegisterUserRequest, RegisterUserResponse } from '../dtos/register-user.dto'

@Injectable()
export class RegisterUserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const existing = await this.userRepository.findByEmailAndCompany(
      request.email,
      request.companyId,
    )
    if (existing) {
      throw new EmailAlreadyInUseError(request.email)
    }

    const userId = await this.authService.createAuthUser(
      request.email,
      request.password,
    )

    const user = User.createCustomer({
      id: userId,
      email: request.email,
      displayName: request.displayName,
      phone: request.phone,
      companyId: request.companyId,
    })

    const saved = await this.userRepository.save(user)

    return RegisterUserResponse.fromEntity(saved)
  }
}
