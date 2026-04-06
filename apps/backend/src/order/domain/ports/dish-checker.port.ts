export type DishInfo = {
  name: string
  basePrice: number
  variantGroups: Array<{
    id: string
    options: Array<{ id: string; name: string; priceAdjustment: number }>
  }>
  modifierGroups: Array<{
    id: string
    options: Array<{ id: string; name: string; extraPrice: number }>
  }>
}

export interface IDishCheckerPort {
  getActiveDishInfo(dishId: string, companyId: string): Promise<DishInfo | null>
}
