---
name: yantar-domain-menu
description: >
  Documentacion viva del bounded context Menu: carta del restaurante,
  platos, categorias, variantes, modificadores configurables, precios e imagenes.
---

# Menu Domain

## Proposito

Gestiona el catalogo de platos de la empresa, organizado por categorias. Cada plato tiene precios, fotos, descripcion, y un sistema configurable de variantes (tamaños) y modificadores (extras, eliminaciones). La carta es compartida entre todas las sedes de una empresa.

## Mapa de Archivos

```
apps/backend/src/menu/
├── domain/
│   ├── entities/
│   │   ├── dish.entity.ts              # Plato
│   │   ├── category.entity.ts          # Categoria
│   │   ├── variant-group.entity.ts     # Grupo de variantes (ej: tamaño)
│   │   └── modifier-group.entity.ts    # Grupo de modificadores (ej: extras)
│   ├── ports/
│   │   ├── dish-repository.port.ts
│   │   └── category-repository.port.ts
│   ├── value-objects/
│   │   ├── dish-status.enum.ts         # ACTIVE, INACTIVE
│   │   ├── variant-option.vo.ts        # Opcion dentro de un grupo de variantes
│   │   └── modifier-option.vo.ts       # Opcion dentro de un grupo de modificadores
│   ├── services/
│   │   └── menu-validation.service.ts
│   └── errors/
│       ├── dish-not-found.error.ts
│       └── category-not-found.error.ts
├── application/
│   ├── services/
│   │   ├── get-menu.service.ts                # Carta completa (customer)
│   │   ├── get-dish-detail.service.ts         # Detalle con variantes/modificadores
│   │   ├── create-dish.service.ts             # Admin
│   │   ├── update-dish.service.ts             # Admin
│   │   ├── toggle-dish-availability.service.ts # Feature flag on/off
│   │   └── manage-categories.service.ts       # CRUD categorias
│   └── dtos/
│       ├── dish.dto.ts
│       ├── category.dto.ts
│       └── menu.dto.ts
├── infrastructure/
│   ├── controllers/
│   │   ├── menu.controller.ts           # /menu routes (publicas, customer)
│   │   └── admin-menu.controller.ts     # /admin/menu routes
│   ├── repositories/
│   │   ├── prisma-dish.repository.ts
│   │   └── prisma-category.repository.ts
│   └── adapters/
│       └── image-upload.adapter.ts      # Subida de fotos de platos
└── menu.module.ts
```

## Entidades

### Dish (Plato)
- **Campos**: `id`, `companyId`, `categoryId`, `name`, `description`, `basePrice`, `imageUrl`, `status` (ACTIVE/INACTIVE), `variantGroups[]`, `modifierGroups[]`, `allergenCodes[]`, `sortOrder`
- **Logica**:
  - `isAvailable()` → status === ACTIVE
  - `calculatePrice(selectedVariant, selectedModifiers[])` → basePrice + variant.priceAdjustment + sum(modifier.extraPrice)
  - `toggleAvailability()` → cambia status

### Category
- **Campos**: `id`, `companyId`, `name`, `description`, `imageUrl`, `sortOrder`, `isActive`

### VariantGroup (Grupo de variantes)
- **Campos**: `id`, `dishId`, `name` (ej: "Tamaño"), `required` (siempre true — obligatorio elegir), `options[]` (VariantOption)
- **Regla**: seleccion unica (radio) — el cliente elige UNA opcion

### VariantOption
- **Campos**: `id`, `name` (ej: "Grande"), `priceAdjustment` (ej: +2.00 sobre basePrice)

### ModifierGroup (Grupo de modificadores)
- **Campos**: `id`, `dishId`, `name` (ej: "Extras", "Sin ingredientes"), `required`, `selectionType` (SINGLE/MULTIPLE), `minSelections`, `maxSelections`, `options[]` (ModifierOption)
- **Logica**:
  - `validateSelection(selectedCount)` → cumple min/max y required?

### ModifierOption
- **Campos**: `id`, `name` (ej: "Extra queso", "Sin cebolla"), `extraPrice` (0 si es eliminacion)

## Ports (Interfaces)

### IDishRepository
```typescript
getByCompany(companyId: string, filters?: { categoryId?: string, status?: DishStatus }): Promise<Dish[]>
getById(dishId: string, companyId: string): Promise<Dish | null>
getByIds(dishIds: string[], companyId: string): Promise<Dish[]>
create(dish: Dish): Promise<Dish>
update(dish: Dish): Promise<Dish>
```

### ICategoryRepository
```typescript
getByCompany(companyId: string): Promise<Category[]>
getById(categoryId: string, companyId: string): Promise<Category | null>
create(category: Category): Promise<Category>
update(category: Category): Promise<Category>
delete(categoryId: string, companyId: string): Promise<void>
```

## Dependencias Cross-Domain

| Direccion | Consumidor | Detalle |
|-----------|-----------|---------|
| Provee | Order | Platos, precios, validacion de variantes/modificadores |
| Provee | Allergen | allergenCodes[] en cada plato |
| Provee | Frontend Customer | Carta navegable con filtros |

## Notas

- La carta es GLOBAL a la empresa (compartida entre sedes)
- Disponibilidad (on/off) es un feature flag simple, no por horario
- Imagenes: Supabase Storage en produccion, filesystem local al principio
- sortOrder permite al admin ordenar categorias y platos manualmente
