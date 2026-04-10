import { GetCompanyConfigService } from '../get-company-config.service'
import { Company } from '../../../domain/entities/company.entity'
import { CompanyNotFoundError } from '../../../domain/errors/company-not-found.error'

const mockCompanyRepository = {
  findById: jest.fn(),
  findBySlug: jest.fn(),
  findByDomain: jest.fn(),
  findByOwnerId: jest.fn(),
  save: jest.fn(),
}

describe('GetCompanyConfigService', () => {
  let service: GetCompanyConfigService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetCompanyConfigService(mockCompanyRepository)
  })

  it('should return public branding config for a valid slug', async () => {
    const company = Company.restore({
      id: 'company-1',
      name: 'Taco Palace',
      slug: 'taco-palace',
      description: 'Best tacos',
      domain: null,
      logoUrl: 'https://cdn.example.com/logo.png',
      faviconUrl: null,
      fontFamily: 'Inter',
      colorPrimary: '#FF5500',
      colorSecondary: '#333333',
      colorAccent: '#FFD700',
      colorBackground: '#FFFFFF',
      colorSurface: '#F5F5F5',
      colorText: '#111111',
      colorTextMuted: '#666666',
      welcomeMessage: 'Welcome!',
      appName: 'Taco App',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockCompanyRepository.findBySlug.mockResolvedValue(company)

    const result = await service.execute('taco-palace')

    expect(result.name).toBe('Taco Palace')
    expect(result.slug).toBe('taco-palace')
    expect(result.description).toBe('Best tacos')
    expect(result.logoUrl).toBe('https://cdn.example.com/logo.png')
    expect(result.fontFamily).toBe('Inter')
    expect(result.colorPrimary).toBe('#FF5500')
    expect(result.welcomeMessage).toBe('Welcome!')
    expect(result.appName).toBe('Taco App')
    expect(result.id).toBe('company-1')
    // Internal fields not exposed
    expect((result as any).isActive).toBeUndefined()
    expect((result as any).domain).toBeUndefined()
  })

  it('should throw CompanyNotFoundError when slug does not exist', async () => {
    mockCompanyRepository.findBySlug.mockResolvedValue(null)

    await expect(service.execute('non-existent')).rejects.toThrow(
      CompanyNotFoundError,
    )
  })
})
