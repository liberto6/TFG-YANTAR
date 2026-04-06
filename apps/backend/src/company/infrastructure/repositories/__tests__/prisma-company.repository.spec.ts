import { PrismaCompanyRepository } from '../prisma-company.repository'

const mockPrismaCompany = {
  id: 'company-1',
  name: 'Taco Palace',
  slug: 'taco-palace',
  description: 'Best tacos in town',
  domain: 'tacopalace.com',
  logoUrl: 'https://cdn.example.com/logo.png',
  faviconUrl: 'https://cdn.example.com/favicon.ico',
  fontFamily: 'Inter',
  colorPrimary: '#FF5500',
  colorSecondary: '#333333',
  colorAccent: '#FFD700',
  colorBackground: '#FFFFFF',
  colorSurface: '#F5F5F5',
  colorText: '#111111',
  colorTextMuted: '#666666',
  welcomeMessage: 'Welcome!',
  appName: 'Taco Palace App',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-06-15'),
}

const mockPrisma = {
  company: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
}

describe('PrismaCompanyRepository', () => {
  let repository: PrismaCompanyRepository

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new PrismaCompanyRepository(mockPrisma as any)
  })

  describe('toDomain mapping', () => {
    it('should map all branding fields correctly', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(mockPrismaCompany)

      const result = await repository.findById('company-1')

      expect(result).not.toBeNull()
      expect(result!.id).toBe('company-1')
      expect(result!.name).toBe('Taco Palace')
      expect(result!.slug).toBe('taco-palace')
      expect(result!.description).toBe('Best tacos in town')
      expect(result!.domain).toBe('tacopalace.com')
      expect(result!.logoUrl).toBe('https://cdn.example.com/logo.png')
      expect(result!.faviconUrl).toBe('https://cdn.example.com/favicon.ico')
      expect(result!.fontFamily).toBe('Inter')
      expect(result!.colorPrimary).toBe('#FF5500')
      expect(result!.colorSecondary).toBe('#333333')
      expect(result!.colorAccent).toBe('#FFD700')
      expect(result!.colorBackground).toBe('#FFFFFF')
      expect(result!.colorSurface).toBe('#F5F5F5')
      expect(result!.colorText).toBe('#111111')
      expect(result!.colorTextMuted).toBe('#666666')
      expect(result!.welcomeMessage).toBe('Welcome!')
      expect(result!.appName).toBe('Taco Palace App')
      expect(result!.isActive).toBe(true)
    })
  })

  describe('findById', () => {
    it('should return a domain Company when found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(mockPrismaCompany)

      const result = await repository.findById('company-1')

      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { id: 'company-1' },
      })
      expect(result).not.toBeNull()
      expect(result!.id).toBe('company-1')
    })

    it('should return null when not found', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findBySlug', () => {
    it('should look up by slug', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(mockPrismaCompany)

      const result = await repository.findBySlug('taco-palace')

      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { slug: 'taco-palace' },
      })
      expect(result).not.toBeNull()
      expect(result!.slug).toBe('taco-palace')
    })
  })

  describe('findByDomain', () => {
    it('should look up by domain', async () => {
      mockPrisma.company.findUnique.mockResolvedValue(mockPrismaCompany)

      const result = await repository.findByDomain('tacopalace.com')

      expect(mockPrisma.company.findUnique).toHaveBeenCalledWith({
        where: { domain: 'tacopalace.com' },
      })
      expect(result).not.toBeNull()
    })
  })

  describe('findByOwnerId', () => {
    it('should find user then load company', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ companyId: 'company-1' })
      mockPrisma.company.findUnique.mockResolvedValue(mockPrismaCompany)

      const result = await repository.findByOwnerId('owner-1')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'owner-1' },
        select: { companyId: true },
      })
      expect(result).not.toBeNull()
    })

    it('should return null when user has no company', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ companyId: null })

      const result = await repository.findByOwnerId('owner-1')

      expect(result).toBeNull()
    })
  })

  describe('save', () => {
    it('should upsert the company and return domain entity', async () => {
      mockPrisma.company.upsert.mockResolvedValue(mockPrismaCompany)

      const company = (await repository.findById('company-1')) ?? (() => {
        mockPrisma.company.findUnique.mockResolvedValue(mockPrismaCompany)
        return repository.findById('company-1')
      })()

      mockPrisma.company.findUnique.mockResolvedValue(mockPrismaCompany)
      const loaded = await repository.findById('company-1')

      mockPrisma.company.upsert.mockResolvedValue(mockPrismaCompany)
      const result = await repository.save(loaded!)

      expect(mockPrisma.company.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'company-1' },
          create: expect.objectContaining({
            id: 'company-1',
            name: 'Taco Palace',
            slug: 'taco-palace',
          }),
          update: expect.objectContaining({
            id: 'company-1',
            name: 'Taco Palace',
          }),
        }),
      )
      expect(result.id).toBe('company-1')
    })
  })
})
