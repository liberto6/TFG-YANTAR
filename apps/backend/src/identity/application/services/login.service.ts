import { Injectable, Inject } from '@nestjs/common'
import { IUserRepository } from '../../domain/ports/user-repository.port'
import { IPasswordService } from '../../domain/ports/password-service.port'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error'
import { LoginRequest, LoginResponse } from '../dtos/login.dto'
import { UserDto } from '../dtos/user.dto'

@Injectable()
export class LoginService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmailAndCompany(
      request.email,
      request.companyId,
    )
    if (!user) {
      throw new UserNotFoundError(request.email)
    }

    // Verifica contraseña si el usuario tiene hash almacenado.
    // Usuarios legacy sin passwordHash (ej. importados) se omiten para compatibilidad.
    if (user.passwordHash !== null) {
      const valid = await this.passwordService.verify(
        request.password,
        user.passwordHash,
      )
      if (!valid) {
        throw new InvalidCredentialsError()
      }
    }

    const response = new LoginResponse()
    response.user = UserDto.fromEntity(user)
    response.token = user.id
    return response
  }
}
