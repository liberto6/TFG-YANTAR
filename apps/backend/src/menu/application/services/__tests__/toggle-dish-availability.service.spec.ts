import { ToggleDishAvailabilityService } from '../toggle-dish-availability.service'
import { Dish } from '../../../domain/entities/dish.entity'
import { DishStatus } from '@yantar/shared'
import { DishNotFoundError } from '../../../domain/errors/dish-not-found.error'

const mockDishRepository = {
  findByCompanyId: jest.fn(),
  findById: jest.fn(),
  findByIds: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
}

describe('ToggleDishAvailabilityService', () => {
  let service: ToggleDishAvailabilityService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ToggleDishAvailabilityService(mockDishRepository)
  })

  it('should toggle ACTIVE dish to INACTIVE', async () => {
    const dish = Dish.create({
      id: 'dish-1',
      companyId: 'co-1',
      categoryId: 'cat-1',
      name: 'Pizza',
      basePrice: 10.0,
    })
    mockDishRepository.findById.mockResolvedValue(dish)
    mockDishRepository.save.mockImplementation(async (d: Dish) => d)

    const result = await service.execute('co-1', 'dish-1')

    expect(result.status).toBe(DishStatus.INACTIVE)
  })

  it('should toggle INACTIVE dish to ACTIVE', async () => {
    const dish = Dish.create({
      id: 'dish-1',
      companyId: 'co-1',
      categoryId: 'cat-1',
      name: 'Pizza',
      basePrice: 10.0,
    }).toggleAvailability()

    mockDishRepository.findById.mockResolvedValue(dish)
    mockDishRepository.save.mockImplementation(async (d: Dish) => d)

    const result = await service.execute('co-1', 'dish-1')

    expect(result.status).toBe(DishStatus.ACTIVE)
  })

  it('should throw DishNotFoundError when dish does not exist', async () => {
    mockDishRepository.findById.mockResolvedValue(null)

    await expect(
      service.execute('co-1', 'non-existent'),
    ).rejects.toThrow(DishNotFoundError)
  })
})
