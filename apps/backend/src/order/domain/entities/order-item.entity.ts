export type OrderItemModifier = {
  name: string
  price: number
}

export class OrderItem {
  readonly id: string
  readonly orderId: string
  readonly dishId: string
  readonly dishName: string
  readonly quantity: number
  readonly unitPrice: number
  readonly selectedVariant: string | null
  readonly selectedModifiers: OrderItemModifier[]
  readonly notes: string | null
  readonly lineTotal: number

  constructor(props: {
    id: string
    orderId: string
    dishId: string
    dishName: string
    quantity: number
    unitPrice: number
    selectedVariant: string | null
    selectedModifiers: OrderItemModifier[]
    notes: string | null
  }) {
    this.id = props.id
    this.orderId = props.orderId
    this.dishId = props.dishId
    this.dishName = props.dishName
    this.quantity = props.quantity
    this.unitPrice = props.unitPrice
    this.selectedVariant = props.selectedVariant
    this.selectedModifiers = props.selectedModifiers
    this.notes = props.notes
    this.lineTotal = Math.round(props.unitPrice * props.quantity * 100) / 100
  }
}
