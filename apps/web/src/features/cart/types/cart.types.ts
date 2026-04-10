export interface CartItemModifier {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  dishId: string;
  dishName: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  selectedVariantOptionId: string | null;
  selectedVariantName: string | null;
  selectedModifierOptionIds: string[];
  selectedModifiers: CartItemModifier[];
  notes: string | null;
  imageUrl: string | null;
}
