export class DeliveryZone {
  readonly id: string
  readonly branchId: string
  readonly companyId: string
  readonly name: string
  readonly postalCodes: string[]
  readonly minOrderAmount: number
  readonly deliveryFee: number
  readonly estimatedTimeMinutes: number
  readonly isActive: boolean

  private constructor(props: {
    id: string
    branchId: string
    companyId: string
    name: string
    postalCodes: string[]
    minOrderAmount: number
    deliveryFee: number
    estimatedTimeMinutes: number
    isActive: boolean
  }) {
    this.id = props.id
    this.branchId = props.branchId
    this.companyId = props.companyId
    this.name = props.name
    this.postalCodes = props.postalCodes
    this.minOrderAmount = props.minOrderAmount
    this.deliveryFee = props.deliveryFee
    this.estimatedTimeMinutes = props.estimatedTimeMinutes
    this.isActive = props.isActive
  }

  static create(props: {
    id: string
    branchId: string
    companyId: string
    name: string
    postalCodes: string[]
    minOrderAmount: number
    deliveryFee: number
    estimatedTimeMinutes: number
  }): DeliveryZone {
    return new DeliveryZone({
      ...props,
      isActive: true,
    })
  }

  static restore(props: {
    id: string
    branchId: string
    companyId: string
    name: string
    postalCodes: string[]
    minOrderAmount: number
    deliveryFee: number
    estimatedTimeMinutes: number
    isActive: boolean
  }): DeliveryZone {
    return new DeliveryZone(props)
  }

  coversPostalCode(code: string): boolean {
    return this.postalCodes.includes(code)
  }

  update(changes: {
    name?: string
    postalCodes?: string[]
    minOrderAmount?: number
    deliveryFee?: number
    estimatedTimeMinutes?: number
  }): DeliveryZone {
    return new DeliveryZone({
      id: this.id,
      branchId: this.branchId,
      companyId: this.companyId,
      name: changes.name !== undefined ? changes.name : this.name,
      postalCodes:
        changes.postalCodes !== undefined
          ? changes.postalCodes
          : this.postalCodes,
      minOrderAmount:
        changes.minOrderAmount !== undefined
          ? changes.minOrderAmount
          : this.minOrderAmount,
      deliveryFee:
        changes.deliveryFee !== undefined
          ? changes.deliveryFee
          : this.deliveryFee,
      estimatedTimeMinutes:
        changes.estimatedTimeMinutes !== undefined
          ? changes.estimatedTimeMinutes
          : this.estimatedTimeMinutes,
      isActive: this.isActive,
    })
  }

  activate(): DeliveryZone {
    return new DeliveryZone({
      id: this.id,
      branchId: this.branchId,
      companyId: this.companyId,
      name: this.name,
      postalCodes: this.postalCodes,
      minOrderAmount: this.minOrderAmount,
      deliveryFee: this.deliveryFee,
      estimatedTimeMinutes: this.estimatedTimeMinutes,
      isActive: true,
    })
  }

  deactivate(): DeliveryZone {
    return new DeliveryZone({
      id: this.id,
      branchId: this.branchId,
      companyId: this.companyId,
      name: this.name,
      postalCodes: this.postalCodes,
      minOrderAmount: this.minOrderAmount,
      deliveryFee: this.deliveryFee,
      estimatedTimeMinutes: this.estimatedTimeMinutes,
      isActive: false,
    })
  }
}
