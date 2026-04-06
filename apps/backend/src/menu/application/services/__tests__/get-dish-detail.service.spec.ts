import { GetDishDetailService } from '../get-dish-detail.service'
import { Dish } from '../../../domain/entities/dish.entity'
import { DishNotFoundError } from '../../../domain/errors/dish-not-found.error'

const mockDishRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('GetDishDetailService', () => {
  let service: GetDishDetailService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new GetDishDetailService(mockDishRepository)
  })

  it('should return dish detail', async () => {
    const dish = Dish.create({
      id: 'dish-1',
      companyId: 'co-1',
      categoryId: 'cat-1',
      name: 'Pizza Margarita',
      basePrice: 10.0,
      allergenCodes: ['GLUTEN', 'DAIRY'],
    })

    mockDishRepository.findById.mockResolvedValue(dish)

    const result = await service.execute('co-1', 'dish-1')

    expect(result.id).toBe('dish-1')
    expect(result.name).toBe('Pizza Margarita')
    expect(result.allergenCodes).toEqual(['GLUTEN', 'DAIRY'])
  })

  it('should throw DishNotFoundError when dish does not exist', async () => {
    mockDishRepository.findById.mockResolvedValue(null)

    await expect(
      service.execute('co-1', 'non-existent'),
    ).rejects.toThrow(DishNotFoundError)
  })
})
