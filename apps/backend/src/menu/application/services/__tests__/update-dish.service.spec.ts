import { UpdateDishService } from '../update-dish.service'
import { Dish } from '../../../domain/entities/dish.entity'
import { Category } from '../../../domain/entities/category.entity'
import { DishNotFoundError } from '../../../domain/errors/dish-not-found.error'
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

const existingDish = Dish.create({
  id: 'dish-1',
  companyId: 'co-1',
  categoryId: 'cat-1',
  name: 'Hamburguesa',
  basePrice: 9.5,
})

describe('UpdateDishService', () => {
  let service: UpdateDishService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new UpdateDishService(mockDishRepository, mockCategoryRepository)
  })

  it('should update dish info', async () => {
    mockDishRepository.findById.mockResolvedValue(existingDish)
    mockDishRepository.save.mockImplementation(async (d: Dish) => d)

    const result = await service.execute('co-1', 'dish-1', {
      name: 'Hamburguesa BBQ',
      basePrice: 11.0,
    })

    expect(result.name).toBe('Hamburguesa BBQ')
    expect(result.basePrice).toBe(11.0)
    expect(result.categoryId).toBe('cat-1')
  })

  it('should validate new category when categoryId changes', async () => {
    mockDishRepository.findById.mockResolvedValue(existingDish)
    mockCategoryRepository.findById.mockResolvedValue(null)

    await expect(
      service.execute('co-1', 'dish-1', { categoryId: 'cat-999' }),
    ).rejects.toThrow(CategoryNotFoundError)
  })

  it('should skip category validation when categoryId is unchanged', async () => {
    mockDishRepository.findById.mockResolvedValue(existingDish)
    mockDishRepository.save.mockImplementation(async (d: Dish) => d)

    // Should not call categoryRepository if categoryId not changed
    const result = await service.execute('co-1', 'dish-1', { name: 'Nueva' })

    expect(mockCategoryRepository.findById).not.toHaveBeenCalled()
    expect(result.name).toBe('Nueva')
  })

  it('should throw DishNotFoundError when dish does not exist', async () => {
    mockDishRepository.findById.mockResolvedValue(null)

    await expect(
      service.execute('co-1', 'non-existent', { name: 'X' }),
    ).rejects.toThrow(DishNotFoundError)
  })

  it('should replace variant groups when provided', async () => {
    mockDishRepository.findById.mockResolvedValue(existingDish)
    mockDishRepository.save.mockImplementation(async (d: Dish) => d)

    const result = await service.execute('co-1', 'dish-1', {
      variantGroups: [
        {
          name: 'Tamaño',
          options: [
            { name: 'Normal', priceAdjustment: 0 },
            { name: 'Doble', priceAdjustment: 4.0 },
          ],
        },
      ],
    })

    expect(result.variantGroups).toHaveLength(1)
    expect(result.variantGroups[0].options).toHaveLength(2)
  })
})
