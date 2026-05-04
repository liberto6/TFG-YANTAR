import { LoginService } from '../login.service'
import { IUserRepository } from '../../../domain/ports/user-repository.port'
import { IPasswordService } from '../../../domain/ports/password-service.port'
import { IAuthService } from '../../../domain/ports/auth-service.port'
import { User } from '../../../domain/entities/user.entity'
import { UserRole } from '@yantar/shared'
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error'
import { InvalidCredentialsError } from '../../../domain/errors/invalid-credentials.error'
import { LoginRequest } from '../../dtos/login.dto'

const COMPANY_ID = 'company-abc'
const FAKE_TOKEN = 'header.payload.signature'

function makeUser(passwordHash: string | null = '$2b$10$hashedpassword') {
  return User.restore({
    id: 'user-1',
    email: 'admin@napoli.es',
    displayName: 'Admin',
    phone: null,
    avatarUrl: null,
    companyId: COMPANY_ID,
    role: UserRole.RESTAURANT_ADMIN,
    preferences: {},
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

describe('LoginService', () => {
  let service: LoginService
  let userRepository: jest.Mocked<IUserRepository>
  let passwordService: jest.Mocked<IPasswordService>
  let authService: jest.Mocked<IAuthService>

  const request: LoginRequest = {
    email: 'admin@napoli.es',
    password: 'admin123',
    companyId: COMPANY_ID,
  }

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailAndCompany: jest.fn(),
      save: jest.fn(),
    }
    passwordService = {
      hash: jest.fn(),
      verify: jest.fn(),
    }
    authService = {
      createAuthUser: jest.fn(),
      issueToken: jest.fn().mockReturnValue(FAKE_TOKEN),
      getUserIdFromToken: jest.fn(),
    }

    service = new LoginService(userRepository, passwordService, authService)
  })

  it('debería lanzar UserNotFoundError si el email no existe en la empresa', async () => {
    userRepository.findByEmailAndCompany.mockResolvedValue(null)

    await expect(service.execute(request)).rejects.toThrow(UserNotFoundError)
    expect(passwordService.verify).not.toHaveBeenCalled()
    expect(authService.issueToken).not.toHaveBeenCalled()
  })

  it('debería lanzar InvalidCredentialsError si la contraseña no coincide', async () => {
    userRepository.findByEmailAndCompany.mockResolvedValue(makeUser())
    passwordService.verify.mockResolvedValue(false)

    await expect(service.execute(request)).rejects.toThrow(InvalidCredentialsError)
    expect(passwordService.verify).toHaveBeenCalledWith('admin123', '$2b$10$hashedpassword')
    expect(authService.issueToken).not.toHaveBeenCalled()
  })

  it('debería emitir un JWT con sub, role y companyId si la contraseña es correcta', async () => {
    userRepository.findByEmailAndCompany.mockResolvedValue(makeUser())
    passwordService.verify.mockResolvedValue(true)

    const result = await service.execute(request)

    expect(authService.issueToken).toHaveBeenCalledWith({
      sub: 'user-1',
      role: UserRole.RESTAURANT_ADMIN,
      companyId: COMPANY_ID,
    })
    expect(result.token).toBe(FAKE_TOKEN)
    expect(result.user.email).toBe('admin@napoli.es')
    expect(result.user.id).toBe('user-1')
  })

  it('debería verificar contra el hash almacenado del usuario', async () => {
    const user = makeUser('$2b$10$specificHash')
    userRepository.findByEmailAndCompany.mockResolvedValue(user)
    passwordService.verify.mockResolvedValue(true)

    await service.execute(request)

    expect(passwordService.verify).toHaveBeenCalledWith('admin123', '$2b$10$specificHash')
  })

  it('debería omitir la verificación si el usuario no tiene passwordHash (compatibilidad con seed legacy)', async () => {
    userRepository.findByEmailAndCompany.mockResolvedValue(makeUser(null))

    const result = await service.execute(request)

    expect(passwordService.verify).not.toHaveBeenCalled()
    expect(authService.issueToken).toHaveBeenCalled()
    expect(result.token).toBe(FAKE_TOKEN)
  })
})
