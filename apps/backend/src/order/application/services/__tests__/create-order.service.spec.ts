import { DeliveryMode } from '@yantar/shared'
import { CreateOrderService } from '../create-order.service'
import { EmptyCartError } from '../../../domain/errors/empty-cart.error'
import { DishNotFoundError } from '../../../../menu/domain/errors/dish-not-found.error'

const mockOrderRepository = { getById: jest.fn(), getByCustomer: jest.fn(), getActiveByBranch: jest.fn(), getByBranchAndDate: jest.fn(), save: jest.fn() }
const mockNotificationService = { notifyNewOrder: jest.fn(), notifyOrderStatusChange: jest.fn() }
const mockDishChecker = { getActiveDishInfo: jest.fn() }

const dishInfo = {
  name: 'Hamburguesa',
  basePrice: 9.5,
  variantGroups: [
    { id: 'vg-1', options: [{ id: 'vo-1', name: 'Normal', priceAdjustment: 0 }, { id: 'vo-2', name: 'Grande', priceAdjustment: 2.0 }] },
  ],
  modifierGroups: [
    { id: 'mg-1', options: [{ id: 'mo-1', name: 'Extra queso', extraPrice: 1.0 }] },
  ],
}

describe('CreateOrderService', () => {
  let service: CreateOrderService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new CreateOrderService(mockOrderRepository, mockNotificationService, mockDishChecker)
  })

  it('should create order with correct totals', async () => {
    mockDishChecker.getActiveDishInfo.mockResolvedValue(dishInfo)
    mockOrderRepository.save.mockImplementation(async (o: any) => o)

    const result = await service.execute('co-1', 'user-1', {
      branchId: 'branch-1',
      deliveryMode: DeliveryMode.PICKUP,
      items: [{ dishId: 'dish-1', quantity: 2 }],
    })

    expect(result.subtotal).toBe(19.0) // 9.5 * 2
    expect(result.deliveryFee).toBe(0)
    expect(result.total).toBe(19.0)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].dishName).toBe('Hamburguesa')
    expect(result.items[0].lineTotal).toBe(19.0)
  })

  it('should apply variant price adjustment', async () => {
    mockDishChecker.getActiveDishInfo.mockResolvedValue(dishInfo)
    mockOrderRepository.save.mockImplementation(async (o: any) => o)

    const result = await service.execute('co-1', 'user-1', {
      branchId: 'branch-1',
      deliveryMode: DeliveryMode.PICKUP,
      items: [{ dishId: 'dish-1', quantity: 1, selectedVariantOptionId: 'vo-2' }],
    })

    expect(result.items[0].unitPrice).toBe(11.5) // 9.5 + 2.0
    expect(result.items[0].selectedVariant).toBe('Grande')
  })

  it('should apply modifier prices', async () => {
    mockDishChecker.getActiveDishInfo.mockResolvedValue(dishInfo)
    mockOrderRepository.save.mockImplementation(async (o: any) => o)

    const result = await service.execute('co-1', 'user-1', {
      branchId: 'branch-1',
      deliveryMode: DeliveryMode.PICKUP,
      items: [{ dishId: 'dish-1', quantity: 1, selectedModifierOptionIds: ['mo-1'] }],
    })

    expect(result.items[0].unitPrice).toBe(10.5) // 9.5 + 1.0
    expect(result.items[0].selectedModifiers[0].name).toBe('Extra queso')
  })

  it('should add delivery fee when DELIVERY mode', async () => {
    mockDishChecker.getActiveDishInfo.mockResolvedValue(dishInfo)
    mockOrderRepository.save.mockImplementation(async (o: any) => o)

    const result = await service.execute('co-1', 'user-1', {
      branchId: 'branch-1',
      deliveryMode: DeliveryMode.DELIVERY,
      items: [{ dishId: 'dish-1', quantity: 1 }],
      deliveryFee: 2.5,
      deliveryAddress: 'Calle Mayor 1',
    })

    expect(result.deliveryFee).toBe(2.5)
    expect(result.total).toBe(12.0) // 9.5 + 2.5
  })

  it('should throw EmptyCartError when no items', async () => {
    await expect(
      service.execute('co-1', 'user-1', {
        branchId: 'branch-1',
        deliveryMode: DeliveryMode.PICKUP,
        items: [],
      }),
    ).rejects.toThrow(EmptyCartError)
  })

  it('should throw DishNotFoundError when dish is not active', async () => {
    mockDishChecker.getActiveDishInfo.mockResolvedValue(null)

    await expect(
      service.execute('co-1', 'user-1', {
        branchId: 'branch-1',
        deliveryMode: DeliveryMode.PICKUP,
        items: [{ dishId: 'non-existent', quantity: 1 }],
      }),
    ).rejects.toThrow(DishNotFoundError)
  })

  it('should notify after order creation', async () => {
    mockDishChecker.getActiveDishInfo.mockResolvedValue(dishInfo)
    mockOrderRepository.save.mockImplementation(async (o: any) => o)
    mockNotificationService.notifyNewOrder.mockResolvedValue(undefined)

    await service.execute('co-1', 'user-1', {
      branchId: 'branch-1',
      deliveryMode: DeliveryMode.PICKUP,
      items: [{ dishId: 'dish-1', quantity: 1 }],
    })

    expect(mockNotificationService.notifyNewOrder).toHaveBeenCalledTimes(1)
  })
})
