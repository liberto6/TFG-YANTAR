import { CreateDishService } from '../create-dish.service'
import { Category } from '../../../domain/entities/category.entity'
import { Dish } from '../../../domain/entities/dish.entity'
import { CategoryNotFoundError } from '../../../domain/errors/category-not-found.error'

const mockDishRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

const mockCategoryRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('CreateDishService', () => {
  let service: CreateDishService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CreateDishService(mockDishRepository, mockCategoryRepository)
  })

  it('should create a dish when category exists', async () => {
    const category = Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Entrantes' })
    mockCategoryRepository.findById.mockResolvedValue(category)
    mockDishRepository.save.mockImplementation(async (d: Dish) => d)

    const result = await service.execute('co-1', {
      categoryId: 'cat-1',
      name: 'Croquetas',
      basePrice: 6.5,
      allergenCodes: ['GLUTEN', 'DAIRY'],
    })

    expect(result.name).toBe('Croquetas')
    expect(result.companyId).toBe('co-1')
    expect(result.basePrice).toBe(6.5)
    expect(result.allergenCodes).toEqual(['GLUTEN', 'DAIRY'])
    expect(mockDishRepository.save).toHaveBeenCalledTimes(1)
  })

  it('should create a dish with variant groups', async () => {
    const category = Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Pizzas' })
    mockCategoryRepository.findById.mockResolvedValue(category)
    mockDishRepository.save.mockImplementation(async (d: Dish) => d)

    const result = await service.execute('co-1', {
      categoryId: 'cat-1',
      name: 'Pizza Margarita',
      basePrice: 10.0,
      variantGroups: [
        {
          name: 'Tamaño',
          options: [
            { name: 'Pequeña', priceAdjustment: 0 },
            { name: 'Grande', priceAdjustment: 3.0 },
          ],
        },
      ],
    })

    expect(result.variantGroups).toHaveLength(1)
    expect(result.variantGroups[0].name).toBe('Tamaño')
    expect(result.variantGroups[0].options).toHaveLength(2)
  })

  it('should throw CategoryNotFoundError when category does not exist', async () => {
    mockCategoryRepository.findById.mockResolvedValue(null)

    await expect(
      service.execute('co-1', {
        categoryId: 'non-existent',
        name: 'Croquetas',
        basePrice: 6.5,
      }),
    ).rejects.toThrow(CategoryNotFoundError)
  })
})
