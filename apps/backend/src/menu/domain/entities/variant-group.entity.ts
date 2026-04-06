export class VariantOption {
  readonly id: string
  readonly variantGroupId: string
  readonly name: string
  readonly priceAdjustment: number
  readonly sortOrder: number

  constructor(props: {
    id: string
    variantGroupId: string
    name: string
    priceAdjustment: number
    sortOrder: number
  }) {
    this.id = props.id
    this.variantGroupId = props.variantGroupId
    this.name = props.name
    this.priceAdjustment = props.priceAdjustment
    this.sortOrder = props.sortOrder
  }
}

export class VariantGroup {
  readonly id: string
  readonly dishId: string
  readonly name: string
  readonly required: boolean
  readonly sortOrder: number
  readonly options: VariantOption[]

  constructor(props: {
    id: string
    dishId: string
    name: string
    required: boolean
    sortOrder: number
    options: VariantOption[]
  }) {
    this.id = props.id
    this.dishId = props.dishId
    this.name = props.name
    this.required = props.required
    this.sortOrder = props.sortOrder
    this.options = props.options
  }

  findOption(optionId: string): VariantOption | undefined {
    return this.options.find((o) => o.id === optionId)
  }
}
