/**
 * Fixtures de la demo de Yantar.
 *
 * Datos en memoria que simulan a Ana, dueña de la Pizzería Nápoli, montando su
 * restaurante en Yantar de principio a fin. Se usan exclusivamente en la ruta
 * `/demo`; no tocan la base de datos ni las APIs reales.
 */

export const DEMO_TENANT_SLUG = "napoli";

export const DEMO_OWNER = {
  name: "Ana Romero",
  email: "ana@pizzerianapoli.es",
  password: "Napoli2026!",
};

export const DEMO_COMPANY = {
  id: "demo-company-1",
  slug: DEMO_TENANT_SLUG,
  name: "Pizzería Nápoli",
  appName: "Pide en Nápoli",
  welcomeMessage: "Auténtica pizza napolitana desde 1987",
  colorPrimary: "#c0392b",
  colorAccent: "#e67e22",
  logoUrl: null,
};

export const DEMO_BRANCH = {
  id: "demo-branch-1",
  slug: "centro",
  name: "Sede Centro",
  address: "Calle Mayor 12, Madrid",
  serviceModes: ["PICKUP", "DELIVERY"] as const,
};

export const DEMO_CATEGORIES = [
  { id: "demo-cat-1", name: "Pizzas" },
  { id: "demo-cat-2", name: "Pasta" },
  { id: "demo-cat-3", name: "Entrantes" },
  { id: "demo-cat-4", name: "Bebidas" },
  { id: "demo-cat-5", name: "Postres" },
];

export interface DemoDish {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  allergens: string[];
}

export const DEMO_DISHES: DemoDish[] = [
  {
    id: "demo-dish-1",
    categoryId: "demo-cat-1",
    name: "Margherita",
    description: "Tomate, mozzarella fior di latte, albahaca fresca",
    basePrice: 10.5,
    allergens: ["GLUTEN", "DAIRY"],
  },
  {
    id: "demo-dish-2",
    categoryId: "demo-cat-1",
    name: "Pepperoni",
    description: "Tomate, mozzarella, pepperoni picante",
    basePrice: 12.5,
    allergens: ["GLUTEN", "DAIRY"],
  },
  {
    id: "demo-dish-3",
    categoryId: "demo-cat-1",
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola, parmesano, ricotta",
    basePrice: 13.5,
    allergens: ["GLUTEN", "DAIRY"],
  },
];

export const DEMO_VARIANTS = [
  { id: "demo-var-s", name: "Pequeña (26cm)", priceAdjustment: -2.0 },
  { id: "demo-var-m", name: "Mediana (30cm)", priceAdjustment: 0.0 },
  { id: "demo-var-l", name: "Grande (36cm)", priceAdjustment: 3.0 },
];

export const DEMO_MODIFIERS = [
  { id: "demo-mod-1", name: "Extra mozzarella", extraPrice: 1.5 },
  { id: "demo-mod-2", name: "Champiñones", extraPrice: 1.0 },
  { id: "demo-mod-3", name: "Aceitunas negras", extraPrice: 0.8 },
];

export const DEMO_CUSTOMER = {
  name: "Carlos García",
  address: "Calle Mayor 18, Madrid",
};

export const DEMO_ORDER = {
  id: "demo-order-1",
  items: [
    {
      dishId: "demo-dish-2",
      dishName: "Pepperoni",
      quantity: 1,
      variant: "Mediana (30cm)",
      modifiers: ["Extra mozzarella"],
      unitPrice: 14.0,
    },
    {
      dishId: "demo-dish-3",
      dishName: "Quattro Formaggi",
      quantity: 1,
      variant: "Grande (36cm)",
      modifiers: [],
      unitPrice: 16.5,
    },
  ],
  subtotal: 30.5,
  deliveryFee: 2.5,
  total: 33.0,
  scheduledTime: "14:30",
};

// ── Adaptadores con el shape exacto de los tipos del frontend ─────────────────

import type {
  Dish,
  Category,
  VariantGroup,
  ModifierGroup,
} from "@/features/menu/types/menu.types";

const NAPOLI_VARIANT_GROUP: VariantGroup = {
  id: "demo-vg",
  name: "Tamaño",
  required: true,
  sortOrder: 0,
  options: DEMO_VARIANTS.map((v, i) => ({
    id: v.id,
    name: v.name,
    priceAdjustment: v.priceAdjustment,
    sortOrder: i,
  })),
};

const NAPOLI_MODIFIER_GROUP: ModifierGroup = {
  id: "demo-mg",
  name: "Ingredientes extra",
  required: false,
  selectionType: "MULTIPLE",
  minSelections: 0,
  maxSelections: 5,
  sortOrder: 0,
  options: DEMO_MODIFIERS.map((m, i) => ({
    id: m.id,
    name: m.name,
    extraPrice: m.extraPrice,
    sortOrder: i,
  })),
};

/** Platos de demo con shape Dish completo, listos para `<DishCard />`. */
export const NAPOLI_DISHES: Dish[] = DEMO_DISHES.map((d) => ({
  id: d.id,
  companyId: DEMO_COMPANY.id,
  categoryId: d.categoryId,
  name: d.name,
  description: d.description,
  basePrice: d.basePrice,
  imageUrl: null,
  status: "ACTIVE",
  sortOrder: 0,
  allergenCodes: d.allergens,
  variantGroups: [NAPOLI_VARIANT_GROUP],
  modifierGroups: [NAPOLI_MODIFIER_GROUP],
}));

/** Categorías de demo con shape Category completo (con dishes anidados). */
export const NAPOLI_CATEGORIES: Category[] = DEMO_CATEGORIES.map((c, i) => ({
  id: c.id,
  companyId: DEMO_COMPANY.id,
  name: c.name,
  description: null,
  imageUrl: null,
  sortOrder: i,
  isActive: true,
  dishes: i === 0 ? NAPOLI_DISHES : [],
}));

export const NAPOLI_PEPPERONI: Dish = NAPOLI_DISHES[1]!;
