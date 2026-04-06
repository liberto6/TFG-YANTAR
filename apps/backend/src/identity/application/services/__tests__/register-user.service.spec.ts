import { UserRole } from '@yantar/shared'
import { RegisterUserService } from '../register-user.service'
import { IUserRepository } from '../../../domain/ports/user-repository.port'
import { IAuthService } from '../../../domain/ports/auth-service.port'
import { User } from '../../../domain/entities/user.entity'
import { EmailAlreadyInUseError } from '../../../domain/errors/email-already-in-use.error'
import { RegisterUserRequest } from '../../dtos/register-user.dto'

describe('RegisterUserService', () => {
  let service: RegisterUserService
  let userRepository: jest.Mocked<IUserRepository>
  let authService: jest.Mocked<IAuthService>

  const request: RegisterUserRequest = {
    email: 'alice@example.com',
    password: 'securePass123',
    displayName: 'Alice',
    companyId: 'company-1',
  }

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailAndCompany: jest.fn(),
      save: jest.fn(),
    }
    authService = {
      createAuthUser: jest.fn(),
      getUserIdFromToken: jest.fn(),
    }

    service = new RegisterUserService(userRepository, authService)
  })

  it('should create a customer user on happy path', async () => {
    userRepository.findByEmailAndCompany.mockResolvedValue(null)
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute(request)

    expect(userRepository.findByEmailAndCompany).toHaveBeenCalledWith(
      'alice@example.com',
      'company-1',
    )
    expect(authService.createAuthUser).toHaveBeenCalledWith(
      'alice@example.com',
      'securePass123',
    )
    expect(userRepository.save).toHaveBeenCalledTimes(1)

    const savedUser = userRepository.save.mock.calls[0][0]
    expect(savedUser.id).toBe('auth-user-id')
    expect(savedUser.email).toBe('alice@example.com')
    expect(savedUser.displayName).toBe('Alice')
    expect(savedUser.role).toBe(UserRole.CUSTOMER)
    expect(savedUser.companyId).toBe('company-1')

    expect(result.user).toBeDefined()
    expect(result.user.id).toBe('auth-user-id')
    expect(result.user.email).toBe('alice@example.com')
  })

  it('should throw EmailAlreadyInUseError when email already exists for company', async () => {
    const existingUser = User.createCustomer({
      id: 'existing-id',
      email: 'alice@example.com',
      displayName: 'Existing Alice',
      companyId: 'company-1',
    })
    userRepository.findByEmailAndCompany.mockResolvedValue(existingUser)

    await expect(service.execute(request)).rejects.toThrow(
      EmailAlreadyInUseError,
    )
    expect(authService.createAuthUser).not.toHaveBeenCalled()
    expect(userRepository.save).not.toHaveBeenCalled()
  })

  it('should pass password to authService, not to repository', async () => {
    userRepository.findByEmailAndCompany.mockResolvedValue(null)
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    userRepository.save.mockImplementation(async (user) => user)

    await service.execute(request)

    expect(authService.createAuthUser).toHaveBeenCalledWith(
      'alice@example.com',
      'securePass123',
    )

    const savedUser = userRepository.save.mock.calls[0][0]
    expect(savedUser).not.toHaveProperty('password')
    expect(JSON.stringify(savedUser)).not.toContain('securePass123')
  })

  it('should pass optional phone to user entity', async () => {
    userRepository.findByEmailAndCompany.mockResolvedValue(null)
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    userRepository.save.mockImplementation(async (user) => user)

    await service.execute({ ...request, phone: '+34600000000' })

    const savedUser = userRepository.save.mock.calls[0][0]
    expect(savedUser.phone).toBe('+34600000000')
  })
})
