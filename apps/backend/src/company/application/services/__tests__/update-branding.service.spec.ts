import { UpdateBrandingService } from '../update-branding.service'
import { Company } from '../../../domain/entities/company.entity'
import { CompanyNotFoundError } from '../../../domain/errors/company-not-found.error'

const mockCompanyRepository = {
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findByDomain: jest.fn(),
  findByOwnerId: jest.fn(),
  save: jest.fn(),
}

describe('UpdateBrandingService', () => {
  let service: UpdateBrandingService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UpdateBrandingService(mockCompanyRepository)
  })

  it('should update branding fields and return config', async () => {
    const company = Company.create({ id: 'company-1', name: 'Taco Palace' })

    mockCompanyRepository.findById.mockResolvedValue(company)
    mockCompanyRepository.save.mockImplementation(async (c: Company) => c)

    const result = await service.execute('company-1', {
      logoUrl: 'https://cdn.example.com/new-logo.png',
      colorPrimary: '#00FF00',
      welcomeMessage: 'Hello!',
    })

    expect(result.logoUrl).toBe('https://cdn.example.com/new-logo.png')
    expect(result.colorPrimary).toBe('#00FF00')
    expect(result.welcomeMessage).toBe('Hello!')
    expect(result.name).toBe('Taco Palace')
    expect(mockCompanyRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should throw CompanyNotFoundError when company does not exist', async () => {
    mockCompanyRepository.findById.mockResolvedValue(null)

    await expect(
      service.execute('non-existent', { logoUrl: 'test.png' }),
    ).rejects.toThrow(CompanyNotFoundError)
  })

  it('should preserve existing branding fields not included in the request', async () => {
    const company = Company.restore({
      id: 'company-1',
      name: 'Taco Palace',
      slug: 'taco-palace',
      description: null,
      domain: null,
      logoUrl: 'existing-logo.png',
      faviconUrl: 'existing-favicon.ico',
      fontFamily: 'Inter',
      colorPrimary: '#FF5500',
      colorSecondary: '#333333',
      colorAccent: null,
      colorBackground: null,
      colorSurface: null,
      colorText: null,
      colorTextMuted: null,
      welcomeMessage: null,
      appName: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockCompanyRepository.findById.mockResolvedValue(company)
    mockCompanyRepository.save.mockImplementation(async (c: Company) => c)

    const result = await service.execute('company-1', {
      colorPrimary: '#00FF00',
    })

    expect(result.colorPrimary).toBe('#00FF00')
    expect(result.logoUrl).toBe('existing-logo.png')
    expect(result.faviconUrl).toBe('existing-favicon.ico')
    expect(result.fontFamily).toBe('Inter')
    expect(result.colorSecondary).toBe('#333333')
  })
})
