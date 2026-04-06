import { UserRole } from '@yantar/shared'
import { RegisterBusinessService } from '../register-business.service'
import { IUserRepository } from '../../../domain/ports/user-repository.port'
import { IAuthService } from '../../../domain/ports/auth-service.port'
import { ICompanyRepository } from '../../../../company/domain/ports/company-repository.port'
import { RegisterBusinessRequest } from '../../dtos/register-business.dto'

describe('RegisterBusinessService', () => {
  let service: RegisterBusinessService
  let userRepository: jest.Mocked<IUserRepository>
  let authService: jest.Mocked<IAuthService>
  let companyRepository: jest.Mocked<ICompanyRepository>

  const request: RegisterBusinessRequest = {
    email: 'owner@example.com',
    password: 'securePass123',
    displayName: 'Business Owner',
    companyName: 'My Restaurant',
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
    companyRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByDomain: jest.fn(),
      findByOwnerId: jest.fn(),
      save: jest.fn(),
    }

    service = new RegisterBusinessService(
      userRepository,
      authService,
      companyRepository,
    )
  })

  it('should create a company and an admin user on happy path', async () => {
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    companyRepository.save.mockImplementation(async (company) => company)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute(request)

    expect(authService.createAuthUser).toHaveBeenCalledWith(
      'owner@example.com',
      'securePass123',
    )
    expect(companyRepository.save).toHaveBeenCalledTimes(1)
    expect(userRepository.save).toHaveBeenCalledTimes(1)

    expect(result.user).toBeDefined()
    expect(result.user.id).toBe('auth-user-id')
    expect(result.user.email).toBe('owner@example.com')
    expect(result.company).toBeDefined()
    expect(result.company.name).toBe('My Restaurant')
  })

  it('should generate an auto-slug for the company', async () => {
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    companyRepository.save.mockImplementation(async (company) => company)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute(request)

    expect(result.company.slug).toBe('my-restaurant')
  })

  it('should create user with RESTAURANT_ADMIN role', async () => {
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    companyRepository.save.mockImplementation(async (company) => company)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute(request)

    expect(result.user.role).toBe(UserRole.RESTAURANT_ADMIN)
  })

  it('should set user companyId to match created company id', async () => {
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    companyRepository.save.mockImplementation(async (company) => company)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute(request)

    expect(result.user.companyId).toBe(result.company.id)
  })

  it('should pass optional phone to user entity', async () => {
    authService.createAuthUser.mockResolvedValue('auth-user-id')
    companyRepository.save.mockImplementation(async (company) => company)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute({
      ...request,
      phone: '+34600000000',
    })

    expect(result.user.phone).toBe('+34600000000')
  })
})
