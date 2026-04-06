import { UserRole } from '@yantar/shared'
import { UpdateProfileService } from '../update-profile.service'
import { IUserRepository } from '../../../domain/ports/user-repository.port'
import { User } from '../../../domain/entities/user.entity'
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error'

describe('UpdateProfileService', () => {
  let service: UpdateProfileService
  let userRepository: jest.Mocked<IUserRepository>

  const existingUser = User.createCustomer({
    id: 'user-1',
    email: 'alice@example.com',
    displayName: 'Alice',
    phone: '+34600000000',
    companyId: 'company-1',
  })

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailAndCompany: jest.fn(),
      save: jest.fn(),
    }

    service = new UpdateProfileService(userRepository)
  })

  it('should update displayName', async () => {
    userRepository.findById.mockResolvedValue(existingUser)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute('user-1', {
      displayName: 'Alice Updated',
    })

    expect(userRepository.findById).toHaveBeenCalledWith('user-1')
    expect(userRepository.save).toHaveBeenCalledTimes(1)
    expect(result.displayName).toBe('Alice Updated')
    expect(result.id).toBe('user-1')
    expect(result.email).toBe('alice@example.com')
  })

  it('should throw UserNotFoundError when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null)

    await expect(
      service.execute('nonexistent-id', { displayName: 'New Name' }),
    ).rejects.toThrow(UserNotFoundError)

    expect(userRepository.save).not.toHaveBeenCalled()
  })

  it('should perform partial update leaving other fields unchanged', async () => {
    userRepository.findById.mockResolvedValue(existingUser)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute('user-1', {
      phone: '+34611111111',
    })

    expect(result.displayName).toBe('Alice')
    expect(result.phone).toBe('+34611111111')
    expect(result.email).toBe('alice@example.com')
    expect(result.role).toBe(UserRole.CUSTOMER)
    expect(result.companyId).toBe('company-1')
  })

  it('should update avatarUrl', async () => {
    userRepository.findById.mockResolvedValue(existingUser)
    userRepository.save.mockImplementation(async (user) => user)

    const result = await service.execute('user-1', {
      avatarUrl: 'https://example.com/avatar.png',
    })

    expect(result.avatarUrl).toBe('https://example.com/avatar.png')
  })

  it('should update preferences', async () => {
    userRepository.findById.mockResolvedValue(existingUser)
    userRepository.save.mockImplementation(async (user) => user)

    await service.execute('user-1', {
      preferences: { theme: 'dark' },
    })

    const savedUser = userRepository.save.mock.calls[0][0]
    expect(savedUser.preferences).toEqual({ theme: 'dark' })
  })
})
