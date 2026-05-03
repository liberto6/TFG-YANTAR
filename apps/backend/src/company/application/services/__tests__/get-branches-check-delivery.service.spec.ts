import { GetBranchesService } from '../get-branches.service'
import { CheckDeliveryService } from '../check-delivery.service'
import { Branch } from '../../../domain/entities/branch.entity'
import { DeliveryZone } from '../../../domain/entities/delivery-zone.entity'
import { ServiceMode } from '@yantar/shared'
import { CompanyNotFoundError } from '../../../domain/errors/company-not-found.error'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const sevillePolygon = {
  type: 'Polygon' as const,
  coordinates: [[
    [-6.0, 37.3], [-5.8, 37.3], [-5.8, 37.5], [-6.0, 37.5], [-6.0, 37.3],
  ]],
}

const makeBranch = (id: string, companyId: string, name: string, slug?: string) =>
  Branch.restore({
    id, companyId, slug: slug ?? id, name, address: 'Test 1', phone: null, email: null,
    latitude: null, longitude: null,
    serviceModes: [ServiceMode.PICKUP, ServiceMode.DELIVERY],
    isActive: true, createdAt: new Date(), updatedAt: new Date(),
  })

const makeZone = (id: string, branchId: string, polygon: object | null) =>
  DeliveryZone.restore({
    id, branchId, companyId: 'c1', name: 'Zona Test',
    postalCodes: [], minOrderAmount: 0, deliveryFee: 2.5,
    estimatedTimeMinutes: 30, isActive: true, polygon,
  })

// ─── GetBranchesService ────────────────────────────────────────────────────

describe('GetBranchesService', () => {
  let service: GetBranchesService
  let companyRepo: { findBySlug: jest.Mock }
  let branchRepo: { findByCompanyId: jest.Mock }

  beforeEach(() => {
    companyRepo = { findBySlug: jest.fn() }
    branchRepo = { findByCompanyId: jest.fn() }
    service = new GetBranchesService(companyRepo as any, branchRepo as any)
  })

  it('throws CompanyNotFoundError when slug does not exist', async () => {
    companyRepo.findBySlug.mockResolvedValue(null)
    await expect(service.execute('unknown')).rejects.toThrow(CompanyNotFoundError)
  })

  it('returns active branches for the company', async () => {
    const company = { id: 'c1', slug: 'napoli' }
    companyRepo.findBySlug.mockResolvedValue(company)
    branchRepo.findByCompanyId.mockResolvedValue([
      makeBranch('b1', 'c1', 'Napoli Mairena'),
      makeBranch('b2', 'c1', 'Napoli Tomares'),
    ])

    const result = await service.execute('napoli')

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('b1')
    expect(result[0].name).toBe('Napoli Mairena')
    expect(result[1].name).toBe('Napoli Tomares')
  })

  it('returns empty array when company has no branches', async () => {
    companyRepo.findBySlug.mockResolvedValue({ id: 'c1', slug: 'napoli' })
    branchRepo.findByCompanyId.mockResolvedValue([])
    const result = await service.execute('napoli')
    expect(result).toEqual([])
  })
})

// ─── CheckDeliveryService ──────────────────────────────────────────────────

describe('CheckDeliveryService', () => {
  let service: CheckDeliveryService
  let zoneRepo: { findByBranchId: jest.Mock }

  beforeEach(() => {
    zoneRepo = { findByBranchId: jest.fn() }
    service = new CheckDeliveryService(zoneRepo as any)
  })

  it('returns the matching zone when point is inside polygon', async () => {
    zoneRepo.findByBranchId.mockResolvedValue([
      makeZone('z1', 'b1', sevillePolygon),
    ])

    const result = await service.execute('b1', 37.38, -5.99)

    expect(result).not.toBeNull()
    expect(result!.zoneId).toBe('z1')
    expect(result!.deliveryFee).toBe(2.5)
  })

  it('returns null when point is outside all polygons', async () => {
    zoneRepo.findByBranchId.mockResolvedValue([
      makeZone('z1', 'b1', sevillePolygon),
    ])

    const result = await service.execute('b1', 40.41, -3.70) // Madrid

    expect(result).toBeNull()
  })

  it('returns null when branch has no delivery zones', async () => {
    zoneRepo.findByBranchId.mockResolvedValue([])
    const result = await service.execute('b1', 37.38, -5.99)
    expect(result).toBeNull()
  })

  it('skips zones without polygon defined', async () => {
    zoneRepo.findByBranchId.mockResolvedValue([
      makeZone('z1', 'b1', null),
    ])
    const result = await service.execute('b1', 37.38, -5.99)
    expect(result).toBeNull()
  })
})
