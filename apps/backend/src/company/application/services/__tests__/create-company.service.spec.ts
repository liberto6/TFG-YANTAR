import { CreateCompanyService } from '../create-company.service'
import { Company } from '../../../domain/entities/company.entity'

const mockCompanyRepository = {
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findByDomain: jest.fn(),
  findByOwnerId: jest.fn(),
  save: jest.fn(),
}

describe('CreateCompanyService', () => {
  let service: CreateCompanyService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CreateCompanyService(mockCompanyRepository)
  })

  it('should create a company with a unique slug', async () => {
    mockCompanyRepository.findBySlug.mockResolvedValue(null)
    mockCompanyRepository.save.mockImplementation(async (company: Company) => company)

    const result = await service.execute({ name: 'Taco Palace' })

    expect(result.name).toBe('Taco Palace')
    expect(result.slug).toBe('taco-palace')
    expect(result.id).toBeDefined()
    expect(mockCompanyRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should append suffix when slug is taken', async () => {
    mockCompanyRepository.findBySlug
      .mockResolvedValueOnce(Company.create({ id: 'existing', name: 'Taco Palace' })) // taco-palace taken
      .mockResolvedValueOnce(null) // taco-palace-1 is free

    mockCompanyRepository.save.mockImplementation(async (company: Company) => company)

    const result = await service.execute({ name: 'Taco Palace' })

    expect(result.slug).toBe('taco-palace-1')
    expect(mockCompanyRepository.findBySlug).toHaveBeenCalledTimes(2)
  })

  it('should increment suffix until a free slug is found', async () => {
    mockCompanyRepository.findBySlug
      .mockResolvedValueOnce(Company.create({ id: 'e1', name: 'X' })) // slug taken
      .mockResolvedValueOnce(Company.create({ id: 'e2', name: 'X' })) // slug-1 taken
      .mockResolvedValueOnce(null) // slug-2 free

    mockCompanyRepository.save.mockImplementation(async (company: Company) => company)

    const result = await service.execute({ name: 'Taco Palace' })

    expect(result.slug).toBe('taco-palace-2')
    expect(mockCompanyRepository.findBySlug).toHaveBeenCalledTimes(3)
  })

  it('should call save with the company entity', async () => {
    mockCompanyRepository.findBySlug.mockResolvedValue(null)
    mockCompanyRepository.save.mockImplementation(async (company: Company) => company)

    await service.execute({ name: 'Burger Joint' })

    const savedCompany = mockCompanyRepository.save.mock.calls[0][0]
    expect(savedCompany).toBeInstanceOf(Company)
    expect(savedCompany.name).toBe('Burger Joint')
    expect(savedCompany.slug).toBe('burger-joint')
    expect(savedCompany.isActive).toBe(false)
  })
})
