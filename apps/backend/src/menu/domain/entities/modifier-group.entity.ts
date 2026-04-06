export enum SelectionType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
}

export class ModifierOption {
  readonly id: string
  readonly modifierGroupId: string
  readonly name: string
  readonly extraPrice: number
  readonly sortOrder: number

  constructor(props: {
    id: string
    modifierGroupId: string
    name: string
    extraPrice: number
    sortOrder: number
  }) {
    this.id = props.id
    this.modifierGroupId = props.modifierGroupId
    this.name = props.name
    this.extraPrice = props.extraPrice
    this.sortOrder = props.sortOrder
  }
}

export class ModifierGroup {
  readonly id: string
  readonly dishId: string
  readonly name: string
  readonly required: boolean
  readonly selectionType: SelectionType
  readonly minSelections: number
  readonly maxSelections: number | null
  readonly sortOrder: number
  readonly options: ModifierOption[]

  constructor(props: {
    id: string
    dishId: string
    name: string
    required: boolean
    selectionType: SelectionType
    minSelections: number
    maxSelections: number | null
    sortOrder: number
    options: ModifierOption[]
  }) {
    this.id = props.id
    this.dishId = props.dishId
    this.name = props.name
    this.required = props.required
    this.selectionType = props.selectionType
    this.minSelections = props.minSelections
    this.maxSelections = props.maxSelections
    this.sortOrder = props.sortOrder
    this.options = props.options
  }

  validateSelection(selectedCount: number): boolean {
    if (this.required && selectedCount < this.minSelections) return false
    if (this.maxSelections !== null && selectedCount > this.maxSelections) return false
    return true
  }

  findOption(optionId: string): ModifierOption | undefined {
    return this.options.find((o) => o.id === optionId)
  }
}
