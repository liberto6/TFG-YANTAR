import { GetMenuService } from '../get-menu.service'
import { Category } from '../../../domain/entities/category.entity'
import { Dish } from '../../../domain/entities/dish.entity'

const mockCategoryRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

const mockDishRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('GetMenuService', () => {
  let service: GetMenuService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetMenuService(mockCategoryRepository, mockDishRepository)
  })

  it('should return menu grouped by category', async () => {
    const categories = [
      Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Entrantes', sortOrder: 1 }),
      Category.create({ id: 'cat-2', companyId: 'co-1', name: 'Principales', sortOrder: 0 }),
    ]

    const dishes = [
      Dish.create({ id: 'd-1', companyId: 'co-1', categoryId: 'cat-1', name: 'Croquetas', basePrice: 5.0 }),
      Dish.create({ id: 'd-2', companyId: 'co-1', categoryId: 'cat-2', name: 'Hamburguesa', basePrice: 9.5 }),
      Dish.create({ id: 'd-3', companyId: 'co-1', categoryId: 'cat-2', name: 'Pizza', basePrice: 10.0 }),
    ]

    mockCategoryRepository.findByCompanyId.mockResolvedValue(categories)
    mockDishRepository.findByCompanyId.mockResolvedValue(dishes)

    const result = await service.execute('co-1')

    // Categories sorted by sortOrder: Principales (0) first, Entrantes (1) second
    expect(result.categories).toHaveLength(2)
    expect(result.categories[0].name).toBe('Principales')
    expect(result.categories[0].dishes).toHaveLength(2)
    expect(result.categories[1].name).toBe('Entrantes')
    expect(result.categories[1].dishes).toHaveLength(1)
  })

  it('should exclude inactive categories', async () => {
    const categories = [
      Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Activa' }),
      Category.create({ id: 'cat-2', companyId: 'co-1', name: 'Inactiva' }).deactivate(),
    ]

    mockCategoryRepository.findByCompanyId.mockResolvedValue(categories)
    mockDishRepository.findByCompanyId.mockResolvedValue([])

    const result = await service.execute('co-1')

    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].name).toBe('Activa')
  })

  it('should return empty dishes array for categories with no dishes', async () => {
    const categories = [
      Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Vacía' }),
    ]

    mockCategoryRepository.findByCompanyId.mockResolvedValue(categories)
    mockDishRepository.findByCompanyId.mockResolvedValue([])

    const result = await service.execute('co-1')

    expect(result.categories[0].dishes).toEqual([])
  })

  it('should filter out dishes with excluded allergens', async () => {
    const categories = [
      Category.create({ id: 'cat-1', companyId: 'co-1', name: 'Platos' }),
    ]
    const dishes = [
      Dish.create({ id: 'd-1', companyId: 'co-1', categoryId: 'cat-1', name: 'Croquetas', basePrice: 5.0, allergenCodes: ['GLUTEN', 'DAIRY'] }),
      Dish.create({ id: 'd-2', companyId: 'co-1', categoryId: 'cat-1', name: 'Ensalada', basePrice: 7.0, allergenCodes: [] }),
    ]

    mockCategoryRepository.findByCompanyId.mockResolvedValue(categories)
    mockDishRepository.findByCompanyId.mockResolvedValue(dishes)

    const result = await service.execute('co-1', ['GLUTEN'])

    expect(result.categories[0].dishes).toHaveLength(1)
    expect(result.categories[0].dishes[0].name).toBe('Ensalada')
  })
})
