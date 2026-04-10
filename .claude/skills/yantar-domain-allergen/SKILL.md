---
name: yantar-domain-allergen
description: >
  Documentacion viva del bounded context Allergen: gestion de alergenos,
  filtros alimentarios por intolerancias, y cumplimiento normativo EU.
---

# Allergen Domain

## Proposito

Gestiona la informacion de alergenos de los platos. Permite a los clientes filtrar la carta segun sus intolerancias o preferencias alimentarias. Cumple con la normativa europea (Reglamento UE 1169/2011) que exige informar sobre 14 alergenos principales. El admin marca los alergenos manualmente por plato.

## Mapa de Archivos

```
apps/backend/src/allergen/
├── domain/
│   ├── entities/
│   │   └── allergen.entity.ts           # Allergen (catalogo oficial)
│   ├── ports/
│   │   └── allergen-repository.port.ts
│   ├── value-objects/
│   │   ├── allergen-code.enum.ts        # 14 EU oficiales
│   │   └── dietary-tag.enum.ts          # VEGETARIAN, VEGAN, etc.
│   ├── services/
│   │   └── allergen-filter.service.ts   # Filtrado de carta
│   └── errors/
│       └── allergen-not-found.error.ts
├── application/
│   ├── services/
│   │   ├── get-allergens.service.ts          # Catalogo oficial
│   │   ├── get-dish-allergens.service.ts     # Info de un plato
│   │   └── filter-menu-by-allergens.service.ts # Filtrar carta
│   └── dtos/
│       ├── allergen.dto.ts
│       └── filter-result.dto.ts
├── infrastructure/
│   ├── controllers/
│   │   └── allergen.controller.ts       # /allergens routes
│   └── repositories/
│       └── prisma-allergen.repository.ts
└── allergen.module.ts
```

## Entidades

### Allergen
- **Campos**: `code` (AllergenCode), `name`, `description`, `iconUrl`, `isMajor` (14 EU principales)
- **Inmutable** — catalogo fijo definido por normativa, seed data

## Value Objects

### AllergenCode (14 EU oficiales)
```
GLUTEN, CRUSTACEANS, EGGS, FISH, PEANUTS, SOY, DAIRY,
NUTS, CELERY, MUSTARD, SESAME, SULPHITES, LUPIN, MOLLUSCS
```

### DietaryTag
```
VEGETARIAN, VEGAN, GLUTEN_FREE, DAIRY_FREE, NUT_FREE
```

## Ports (Interfaces)

### IAllergenRepository
```typescript
getAll(): Promise<Allergen[]>
getByCodes(codes: AllergenCode[]): Promise<Allergen[]>
getDishAllergens(dishId: string): Promise<AllergenCode[]>
setDishAllergens(dishId: string, codes: AllergenCode[]): Promise<void>
```

## Servicios de Dominio

### AllergenFilterService (funciones puras)
- `filterSafeDishes(dishes[], excludedAllergens[])` → dishes sin los alergenos excluidos
- `getAllergenSummary(dishAllergenCodes[])` → resumen con iconos

## Dependencias Cross-Domain

| Direccion | Consumidor | Detalle |
|-----------|-----------|---------|
| Provee | Menu | allergenCodes[] en cada plato |
| Provee | Frontend Customer | Filtros y badges de alergenos |

## Notas

- Los 14 alergenos EU son seed data — cargar en migracion inicial
- El admin marca alergenos MANUALMENTE plato por plato (no hay calculo automatico)
- Los alergenos se almacenan como relacion plato ↔ allergenCode
- Considerar campo `mayContain` (trazas) para alergias severas — futuro
