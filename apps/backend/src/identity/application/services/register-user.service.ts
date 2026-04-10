import { Injectable, Inject } from '@nestjs/common'
import { IUserRepository } from '../../domain/ports/user-repository.port'
import { IAuthService } from '../../domain/ports/auth-service.port'
import { IPasswordService } from '../../domain/ports/password-service.port'
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
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const existing = await this.userRepository.findByEmailAndCompany(
      request.email,
      request.companyId,
    )
    if (existing) {
      throw new EmailAlreadyInUseError(request.email)
    }

    const [userId, passwordHash] = await Promise.all([
      this.authService.createAuthUser(request.email, request.password),
      this.passwordService.hash(request.password),
    ])

    const user = User.createCustomer({
      id: userId,
      email: request.email,
      displayName: request.displayName,
      phone: request.phone,
      companyId: request.companyId,
      passwordHash,
    })

    const saved = await this.userRepository.save(user)

    return RegisterUserResponse.fromEntity(saved)
  }
}
