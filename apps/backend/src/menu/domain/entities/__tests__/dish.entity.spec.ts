import { DishStatus } from '@yantar/shared'
import { Dish } from '../dish.entity'
import { VariantGroup, VariantOption } from '../variant-group.entity'
import { ModifierGroup, ModifierOption, SelectionType } from '../modifier-group.entity'

const makeVariantGroup = (dishId: string): VariantGroup => {
  return new VariantGroup({
    id: 'vg-1',
    dishId,
    name: 'Tamaño',
    required: true,
    sortOrder: 0,
    options: [
      new VariantOption({ id: 'vo-1', variantGroupId: 'vg-1', name: 'Normal', priceAdjustment: 0, sortOrder: 0 }),
      new VariantOption({ id: 'vo-2', variantGroupId: 'vg-1', name: 'Grande', priceAdjustment: 2.0, sortOrder: 1 }),
    ],
  })
}

const makeModifierGroup = (dishId: string): ModifierGroup => {
  return new ModifierGroup({
    id: 'mg-1',
    dishId,
    name: 'Extras',
    required: false,
    selectionType: SelectionType.MULTIPLE,
    minSelections: 0,
    maxSelections: 3,
    sortOrder: 0,
    options: [
      new ModifierOption({ id: 'mo-1', modifierGroupId: 'mg-1', name: 'Queso extra', extraPrice: 1.0, sortOrder: 0 }),
      new ModifierOption({ id: 'mo-2', modifierGroupId: 'mg-1', name: 'Bacon', extraPrice: 1.5, sortOrder: 1 }),
    ],
  })
}

describe('Dish', () => {
  const defaultProps = {
    id: 'dish-1',
    companyId: 'company-1',
    categoryId: 'cat-1',
    name: 'Hamburguesa Clásica',
    basePrice: 9.5,
  }

  describe('create', () => {
    it('should create with defaults', () => {
      const dish = Dish.create(defaultProps)

      expect(dish.id).toBe('dish-1')
      expect(dish.companyId).toBe('company-1')
      expect(dish.name).toBe('Hamburguesa Clásica')
      expect(dish.basePrice).toBe(9.5)
      expect(dish.status).toBe(DishStatus.ACTIVE)
      expect(dish.description).toBeNull()
      expect(dish.imageUrl).toBeNull()
      expect(dish.sortOrder).toBe(0)
      expect(dish.allergenCodes).toEqual([])
      expect(dish.variantGroups).toEqual([])
      expect(dish.modifierGroups).toEqual([])
    })

    it('should create with optional fields', () => {
      const dish = Dish.create({
        ...defaultProps,
        description: 'Con lechuga, tomate y cebolla',
        allergenCodes: ['GLUTEN', 'DAIRY'],
        sortOrder: 1,
      })

      expect(dish.description).toBe('Con lechuga, tomate y cebolla')
      expect(dish.allergenCodes).toEqual(['GLUTEN', 'DAIRY'])
      expect(dish.sortOrder).toBe(1)
    })
  })

  describe('isAvailable', () => {
    it('should return true when ACTIVE', () => {
      const dish = Dish.create(defaultProps)
      expect(dish.isAvailable()).toBe(true)
    })

    it('should return false when INACTIVE', () => {
      const dish = Dish.create(defaultProps)
      const toggled = dish.toggleAvailability()
      expect(toggled.isAvailable()).toBe(false)
    })
  })

  describe('toggleAvailability', () => {
    it('should toggle from ACTIVE to INACTIVE', () => {
      const dish = Dish.create(defaultProps)
      const toggled = dish.toggleAvailability()

      expect(toggled.status).toBe(DishStatus.INACTIVE)
      expect(toggled).not.toBe(dish)
    })

    it('should toggle from INACTIVE back to ACTIVE', () => {
      const dish = Dish.create(defaultProps)
      const inactive = dish.toggleAvailability()
      const active = inactive.toggleAvailability()

      expect(active.status).toBe(DishStatus.ACTIVE)
    })
  })

  describe('updateInfo', () => {
    it('should return a new instance with updated fields', () => {
      const dish = Dish.create(defaultProps)
      const updated = dish.updateInfo({ name: 'Hamburguesa BBQ', basePrice: 11.0 })

      expect(updated).not.toBe(dish)
      expect(updated.name).toBe('Hamburguesa BBQ')
      expect(updated.basePrice).toBe(11.0)
      expect(updated.categoryId).toBe('cat-1')
    })

    it('should preserve status when updating info', () => {
      const dish = Dish.create(defaultProps).toggleAvailability()
      const updated = dish.updateInfo({ name: 'Nuevo nombre' })

      expect(updated.status).toBe(DishStatus.INACTIVE)
    })
  })

  describe('calculatePrice', () => {
    it('should return base price when no variant or modifiers', () => {
      const dish = Dish.create(defaultProps)
      expect(dish.calculatePrice()).toBe(9.5)
    })

    it('should add variant price adjustment', () => {
      const dish = Dish.create({
        ...defaultProps,
        variantGroups: [makeVariantGroup('dish-1')],
      })

      // Normal (0 adjustment): 9.5 + 0 = 9.5
      expect(dish.calculatePrice('vo-1')).toBe(9.5)
      // Grande (+2.0): 9.5 + 2.0 = 11.5
      expect(dish.calculatePrice('vo-2')).toBe(11.5)
    })

    it('should add modifier extra prices', () => {
      const dish = Dish.create({
        ...defaultProps,
        modifierGroups: [makeModifierGroup('dish-1')],
      })

      // Queso extra (1.0) + Bacon (1.5): 9.5 + 1.0 + 1.5 = 12.0
      expect(dish.calculatePrice(null, ['mo-1', 'mo-2'])).toBe(12.0)
    })

    it('should combine variant and modifier prices', () => {
      const dish = Dish.create({
        ...defaultProps,
        variantGroups: [makeVariantGroup('dish-1')],
        modifierGroups: [makeModifierGroup('dish-1')],
      })

      // Grande (+2.0) + Queso extra (+1.0): 9.5 + 2.0 + 1.0 = 12.5
      expect(dish.calculatePrice('vo-2', ['mo-1'])).toBe(12.5)
    })
  })

  describe('restore', () => {
    it('should reconstitute all fields', () => {
      const now = new Date()
      const dish = Dish.restore({
        id: 'dish-1',
        companyId: 'company-1',
        categoryId: 'cat-1',
        name: 'Pizza',
        description: null,
        basePrice: 12.0,
        imageUrl: null,
        status: DishStatus.INACTIVE,
        sortOrder: 2,
        allergenCodes: ['GLUTEN'],
        variantGroups: [],
        modifierGroups: [],
        createdAt: now,
        updatedAt: now,
      })

      expect(dish.name).toBe('Pizza')
      expect(dish.status).toBe(DishStatus.INACTIVE)
      expect(dish.allergenCodes).toEqual(['GLUTEN'])
    })
  })
})

describe('ModifierGroup.validateSelection', () => {
  it('should return true when selection meets min', () => {
    const group = new ModifierGroup({
      id: 'mg-1', dishId: 'd-1', name: 'Salsas',
      required: true, selectionType: SelectionType.MULTIPLE,
      minSelections: 1, maxSelections: 2, sortOrder: 0, options: [],
    })

    expect(group.validateSelection(1)).toBe(true)
    expect(group.validateSelection(2)).toBe(true)
  })

  it('should return false when selection is below min', () => {
    const group = new ModifierGroup({
      id: 'mg-1', dishId: 'd-1', name: 'Salsas',
      required: true, selectionType: SelectionType.MULTIPLE,
      minSelections: 1, maxSelections: 2, sortOrder: 0, options: [],
    })

    expect(group.validateSelection(0)).toBe(false)
  })

  it('should return false when selection exceeds max', () => {
    const group = new ModifierGroup({
      id: 'mg-1', dishId: 'd-1', name: 'Salsas',
      required: false, selectionType: SelectionType.MULTIPLE,
      minSelections: 0, maxSelections: 2, sortOrder: 0, options: [],
    })

    expect(group.validateSelection(3)).toBe(false)
  })

  it('should allow any count when maxSelections is null', () => {
    const group = new ModifierGroup({
      id: 'mg-1', dishId: 'd-1', name: 'Toppings',
      required: false, selectionType: SelectionType.MULTIPLE,
      minSelections: 0, maxSelections: null, sortOrder: 0, options: [],
    })

    expect(group.validateSelection(10)).toBe(true)
  })
})
