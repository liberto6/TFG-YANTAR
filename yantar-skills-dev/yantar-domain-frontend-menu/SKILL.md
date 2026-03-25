---
name: yantar-domain-frontend-menu
description: >
  Documentacion viva del dominio frontend Menu: navegacion de carta,
  filtros por categoria y alergenos, detalle de plato, y personalizaciones.
---

# Frontend Menu Domain

## Proposito

Muestra la carta del restaurante organizada por categorias. Permite filtrar por alergenos e intolerancias, ver detalle de cada plato (fotos, descripcion, ingredientes, alergenos), y seleccionar personalizaciones antes de anadir al carrito.

## Mapa de Archivos

```
yantar-frontend/domains/menu/
+-- domain/
|   +-- types.ts                    # Dish, Category, Allergen, DishDetail, etc.
|   +-- rules.ts                    # isSafeForUser(), matchesCategory(), isDishAvailable()
|   +-- rules.test.ts
+-- application/
|   +-- ports.ts                    # IMenuApi, IAllergenApi
|   +-- use-menu-browser.ts         # Hook de navegacion y filtrado
|   +-- use-menu-browser.test.ts
|   +-- use-dish-detail.ts          # Hook de detalle de plato
|   +-- use-dish-detail.test.ts
|   +-- use-allergen-filter.ts      # Hook de filtros de alergenos
|   +-- use-allergen-filter.test.ts
+-- infrastructure/
|   +-- http/
|   |   +-- menu-api-adapter.ts     # IMenuApi -> HTTP calls
|   |   +-- allergen-api-adapter.ts # IAllergenApi -> HTTP calls
|   +-- queries/
|       +-- server-queries.ts       # Server-side queries para SSR
+-- ui/
    +-- MenuBrowser.tsx             # Compound component: carta completa
    +-- MenuBrowser.Categories.tsx  # Tabs/pills de categorias
    +-- MenuBrowser.DishGrid.tsx    # Grid de platos
    +-- MenuBrowser.AllergenBar.tsx # Barra de filtros de alergenos
    +-- DishCard.tsx                # Card de plato (foto, nombre, precio, badges)
    +-- DishDetail.tsx              # Modal/pagina de detalle
    +-- DishDetail.Allergens.tsx    # Seccion de alergenos con iconos
    +-- DishDetail.Customizer.tsx   # Selector de personalizaciones
    +-- AllergenBadge.tsx           # Badge individual de alergeno
```

## Types (domain/types.ts)

### Dish
```typescript
type Dish = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string | null
  categoryId: string
  status: "AVAILABLE" | "UNAVAILABLE"
  tags: DishTag[]
  allergenCodes: AllergenCode[]
}
```

### DishDetail (extends Dish)
```typescript
type DishDetail = Dish & {
  ingredients: string[]
  mayContain: AllergenCode[]      // trazas
  dietaryTags: DietaryTag[]
  customizationOptions: CustomizationOption[]
  nutritionalInfo?: NutritionalInfo
  preparationTimeMinutes?: number
}
```

### Category
```typescript
type Category = {
  id: string
  name: string
  icon: string
  sortOrder: number
  dishCount: number
}
```

### AllergenCode (14 EU)
```typescript
type AllergenCode =
  | "GLUTEN" | "CRUSTACEANS" | "EGGS" | "FISH" | "PEANUTS" | "SOY"
  | "DAIRY" | "NUTS" | "CELERY" | "MUSTARD" | "SESAME" | "SULPHITES"
  | "LUPIN" | "MOLLUSCS"
```

### DishTag
```typescript
type DishTag = "VEGETARIAN" | "VEGAN" | "GLUTEN_FREE" | "SPICY" | "NEW" | "POPULAR" | "CHEF_RECOMMENDATION"
```

## Rules (Predicados puros)

- `isSafeForUser(dish, excludedAllergens[])` -> true si el plato no contiene ningun alergeno excluido
- `matchesCategory(dish, categoryId)` -> true si categoryId === "all" o dish.categoryId === categoryId
- `isDishAvailable(dish)` -> status === "AVAILABLE"
- `matchesSearch(dish, query)` -> name o description contiene query (case-insensitive)

## Ports (application/ports.ts)

### IMenuApi
```typescript
getMenu(restaurantId: string): Promise<{ categories: Category[]; dishes: Dish[] }>
getDishDetail(dishId: string): Promise<DishDetail>
```

### IAllergenApi
```typescript
getAllergens(): Promise<Allergen[]>
getDishAllergens(dishId: string): Promise<DishAllergenInfo>
```

## Hooks

### useMenuBrowser(restaurantId, initialMenu?)
**State**: selectedCategory, searchQuery, excludedAllergens[]
**Computed** (useMemo):
- `filteredDishes` — filtrado por categoria + alergenos + busqueda + disponibilidad
- `categories` — con conteo de platos visibles
- `activeFiltersCount` — numero de filtros activos

### useDishDetail(dishId)
**State**: dish (DishDetail | null), loading, error
**Flujo**: Fetch detalle del plato con alergenos e ingredientes completos.

### useAllergenFilter(userPreferences?)
**State**: excludedAllergens[], availableAllergens[]
**Handlers**: toggleAllergen, clearFilters, loadUserPreferences
**Persistencia**: sincroniza con preferencias del usuario si esta logueado

## Compound Components

### MenuBrowser
```tsx
<MenuBrowser restaurantId={restaurantId}>
  <MenuBrowser.Categories />
  <MenuBrowser.AllergenBar />
  <MenuBrowser.DishGrid />
</MenuBrowser>
```

### DishDetail
```tsx
<DishDetail dishId={dishId}>
  <DishDetail.Allergens />
  <DishDetail.Customizer />
</DishDetail>
```

## Server Queries (infrastructure/queries/server-queries.ts)

### getMenu(restaurantId) -> { categories, dishes }
Query: categorias activas + platos disponibles del restaurante, ordenados por sort_order.

### getDishDetail(dishId) -> DishDetail
Query: plato + alergenos + ingredientes + personalizaciones.

## Tests

| Archivo | Que prueba |
|---------|-----------|
| `rules.test.ts` | isSafeForUser, matchesCategory, matchesSearch |
| `use-menu-browser.test.ts` | Filtrado combinado: categoria + alergenos + search |
| `use-dish-detail.test.ts` | Fetch y estado de carga |
| `use-allergen-filter.test.ts` | Toggle, clear, persistencia |

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- `isSafeForUser` no distingue entre "contiene" y "puede contener" (trazas) — UI deberia indicarlo
- Busqueda es client-side — considerar server-side para cartas grandes (200+ platos)
- Imagenes de platos necesitan lazy loading y placeholder
- Considerar cache de menu con SWR/React Query para evitar refetch innecesario
