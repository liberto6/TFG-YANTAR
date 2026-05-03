import { ResolveTenantService } from '../resolve-tenant.service'

describe('ResolveTenantService', () => {
  let companyRepo: { findBySlug: jest.Mock; findByDomain: jest.Mock }
  let service: ResolveTenantService

  beforeEach(() => {
    companyRepo = { findBySlug: jest.fn(), findByDomain: jest.fn() }
    service = new ResolveTenantService(companyRepo as any, 'yantar.app')
  })

  describe('static helpers', () => {
    it('normalizes host (lowercase, drops port and trailing dot)', () => {
      expect(ResolveTenantService.normalizeHost('Napoli.YANTAR.app:3000')).toBe(
        'napoli.yantar.app',
      )
      expect(ResolveTenantService.normalizeHost('napoli.yantar.app.')).toBe(
        'napoli.yantar.app',
      )
      expect(ResolveTenantService.normalizeHost('')).toBe('')
    })

    it('extracts subdomain when host ends with root', () => {
      expect(
        ResolveTenantService.extractSubdomain('napoli.yantar.app', 'yantar.app'),
      ).toBe('napoli')
      expect(
        ResolveTenantService.extractSubdomain('yantar.app', 'yantar.app'),
      ).toBeNull()
      expect(
        ResolveTenantService.extractSubdomain('napoli.example.es', 'yantar.app'),
      ).toBeNull()
    })

    it('rejects multi-level subdomains (out of A2 scope)', () => {
      expect(
        ResolveTenantService.extractSubdomain(
          'centro.napoli.yantar.app',
          'yantar.app',
        ),
      ).toBeNull()
    })
  })

  it('returns null when no domain match and no subdomain', async () => {
    companyRepo.findByDomain.mockResolvedValue(null)
    const result = await service.execute('yantar.app')
    expect(result).toBeNull()
  })

  it('resolves via custom domain first', async () => {
    companyRepo.findByDomain.mockResolvedValue({ slug: 'napoli' })
    const result = await service.execute('pedir.napoli.es')
    expect(result).toEqual({ slug: 'napoli', source: 'domain' })
    expect(companyRepo.findBySlug).not.toHaveBeenCalled()
  })

  it('falls back to subdomain when no custom domain match', async () => {
    companyRepo.findByDomain.mockResolvedValue(null)
    companyRepo.findBySlug.mockResolvedValue({ slug: 'napoli' })
    const result = await service.execute('napoli.yantar.app')
    expect(result).toEqual({ slug: 'napoli', source: 'subdomain' })
    expect(companyRepo.findBySlug).toHaveBeenCalledWith('napoli')
  })

  it('returns null when subdomain does not match any company', async () => {
    companyRepo.findByDomain.mockResolvedValue(null)
    companyRepo.findBySlug.mockResolvedValue(null)
    const result = await service.execute('unknown.yantar.app')
    expect(result).toBeNull()
  })

  it('returns null on empty host', async () => {
    const result = await service.execute('')
    expect(result).toBeNull()
  })
})
