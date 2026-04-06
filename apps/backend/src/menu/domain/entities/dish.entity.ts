import { DishStatus } from '@yantar/shared'
import { VariantGroup, VariantOption } from './variant-group.entity'
import { ModifierGroup, ModifierOption } from './modifier-group.entity'

export class Dish {
  readonly id: string
  readonly companyId: string
  readonly categoryId: string
  readonly name: string
  readonly description: string | null
  readonly basePrice: number
  readonly imageUrl: string | null
  readonly status: DishStatus
  readonly sortOrder: number
  readonly allergenCodes: string[]
  readonly variantGroups: VariantGroup[]
  readonly modifierGroups: ModifierGroup[]
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: {
    id: string
    companyId: string
    categoryId: string
    name: string
    description: string | null
    basePrice: number
    imageUrl: string | null
    status: DishStatus
    sortOrder: number
    allergenCodes: string[]
    variantGroups: VariantGroup[]
    modifierGroups: ModifierGroup[]
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = props.id
    this.companyId = props.companyId
    this.categoryId = props.categoryId
    this.name = props.name
    this.description = props.description
    this.basePrice = props.basePrice
    this.imageUrl = props.imageUrl
    this.status = props.status
    this.sortOrder = props.sortOrder
    this.allergenCodes = props.allergenCodes
    this.variantGroups = props.variantGroups
    this.modifierGroups = props.modifierGroups
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: {
    id: string
    companyId: string
    categoryId: string
    name: string
    description?: string | null
    basePrice: number
    imageUrl?: string | null
    sortOrder?: number
    allergenCodes?: string[]
    variantGroups?: VariantGroup[]
    modifierGroups?: ModifierGroup[]
  }): Dish {
    const now = new Date()
    return new Dish({
      id: props.id,
      companyId: props.companyId,
      categoryId: props.categoryId,
      name: props.name,
      description: props.description ?? null,
      basePrice: props.basePrice,
      imageUrl: props.imageUrl ?? null,
      status: DishStatus.ACTIVE,
      sortOrder: props.sortOrder ?? 0,
      allergenCodes: props.allergenCodes ?? [],
      variantGroups: props.variantGroups ?? [],
      modifierGroups: props.modifierGroups ?? [],
      createdAt: now,
      updatedAt: now,
    })
  }

  static restore(props: {
    id: string
    companyId: string
    categoryId: string
    name: string
    description: string | null
    basePrice: number
    imageUrl: string | null
    status: DishStatus
    sortOrder: number
    allergenCodes: string[]
    variantGroups: VariantGroup[]
    modifierGroups: ModifierGroup[]
    createdAt: Date
    updatedAt: Date
  }): Dish {
    return new Dish(props)
  }

  isAvailable(): boolean {
    return this.status === DishStatus.ACTIVE
  }

  toggleAvailability(): Dish {
    const newStatus =
      this.status === DishStatus.ACTIVE ? DishStatus.INACTIVE : DishStatus.ACTIVE
    return new Dish({ ...this.toProps(), status: newStatus, updatedAt: new Date() })
  }

  updateInfo(changes: {
    name?: string
    description?: string | null
    basePrice?: number
    imageUrl?: string | null
    categoryId?: string
    sortOrder?: number
    allergenCodes?: string[]
    variantGroups?: VariantGroup[]
    modifierGroups?: ModifierGroup[]
  }): Dish {
    return new Dish({
      id: this.id,
      companyId: this.companyId,
      categoryId:
        changes.categoryId !== undefined ? changes.categoryId : this.categoryId,
      name: changes.name !== undefined ? changes.name : this.name,
      description:
        changes.description !== undefined ? changes.description : this.description,
      basePrice:
        changes.basePrice !== undefined ? changes.basePrice : this.basePrice,
      imageUrl:
        changes.imageUrl !== undefined ? changes.imageUrl : this.imageUrl,
      status: this.status,
      sortOrder:
        changes.sortOrder !== undefined ? changes.sortOrder : this.sortOrder,
      allergenCodes:
        changes.allergenCodes !== undefined
          ? changes.allergenCodes
          : this.allergenCodes,
      variantGroups:
        changes.variantGroups !== undefined
          ? changes.variantGroups
          : this.variantGroups,
      modifierGroups:
        changes.modifierGroups !== undefined
          ? changes.modifierGroups
          : this.modifierGroups,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  calculatePrice(
    selectedVariantOptionId?: string | null,
    selectedModifierOptionIds?: string[],
  ): number {
    let price = this.basePrice

    if (selectedVariantOptionId) {
      for (const group of this.variantGroups) {
        const option = group.findOption(selectedVariantOptionId)
        if (option) {
          price += option.priceAdjustment
          break
        }
      }
    }

    if (selectedModifierOptionIds && selectedModifierOptionIds.length > 0) {
      for (const group of this.modifierGroups) {
        for (const optionId of selectedModifierOptionIds) {
          const option = group.findOption(optionId)
          if (option) {
            price += option.extraPrice
          }
        }
      }
    }

    return Math.round(price * 100) / 100
  }

  private toProps() {
    return {
      id: this.id,
      companyId: this.companyId,
      categoryId: this.categoryId,
      name: this.name,
      description: this.description,
      basePrice: this.basePrice,
      imageUrl: this.imageUrl,
      status: this.status,
      sortOrder: this.sortOrder,
      allergenCodes: this.allergenCodes,
      variantGroups: this.variantGroups,
      modifierGroups: this.modifierGroups,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export { VariantGroup, VariantOption, ModifierGroup, ModifierOption }
