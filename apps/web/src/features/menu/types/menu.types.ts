export interface VariantOption {
  id: string;
  name: string;
  priceAdjustment: number;
  sortOrder: number;
}

export interface VariantGroup {
  id: string;
  name: string;
  required: boolean;
  sortOrder: number;
  options: VariantOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  extraPrice: number;
  sortOrder: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  selectionType: "SINGLE" | "MULTIPLE";
  minSelections: number;
  maxSelections: number | null;
  sortOrder: number;
  options: ModifierOption[];
}

export interface Dish {
  id: string;
  companyId: string;
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  allergenCodes: string[];
  variantGroups: VariantGroup[];
  modifierGroups: ModifierGroup[];
}

export interface Category {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  dishes: Dish[];
}

export interface MenuResponse {
  categories: Category[];
}
