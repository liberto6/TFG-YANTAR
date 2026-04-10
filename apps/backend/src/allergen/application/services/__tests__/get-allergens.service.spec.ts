import { GetAllergensService } from '../get-allergens.service'
import { Allergen } from '../../../domain/entities/allergen.entity'
import { AllergenCode } from '@yantar/shared'

const mockAllergenRepository = {
  getAll: jest.fn(),
  getByCodes: jest.fn(),
}

describe('GetAllergensService', () => {
  let service: GetAllergensService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetAllergensService(mockAllergenRepository)
  })

  it('should return all allergens', async () => {
    const allergens = [
      Allergen.restore({
        id: 'a1',
        code: AllergenCode.GLUTEN,
        name: 'Gluten',
        description: 'Cereales con gluten',
        iconUrl: null,
        isMajor: true,
      }),
      Allergen.restore({
        id: 'a2',
        code: AllergenCode.DAIRY,
        name: 'Leche',
        description: null,
        iconUrl: null,
        isMajor: true,
      }),
    ]

    mockAllergenRepository.getAll.mockResolvedValue(allergens)

    const result = await service.execute()

    expect(result).toHaveLength(2)
    expect(result[0].code).toBe(AllergenCode.GLUTEN)
    expect(result[1].code).toBe(AllergenCode.DAIRY)
  })

  it('should return empty array when no allergens in DB', async () => {
    mockAllergenRepository.getAll.mockResolvedValue([])

    const result = await service.execute()

    expect(result).toEqual([])
  })
})
