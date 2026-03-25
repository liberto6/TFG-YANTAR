---
name: yantar-domain-allergen
description: >
  Documentacion viva del bounded context Allergen: gestion de alergenos,
  ingredientes, filtros alimentarios, y cumplimiento normativo.
---

# Allergen Domain

## Proposito

Gestiona la informacion de alergenos e ingredientes de los platos. Permite a los clientes filtrar el menu segun sus intolerancias o preferencias alimentarias. Cumple con la normativa europea (Reglamento UE 1169/2011) que exige informar sobre 14 alergenos principales.

## Mapa de Archivos

```
yantar_backend/app/allergen/
+-- domain/
|   +-- entities.py          # Allergen, Ingredient, DishAllergenInfo
|   +-- ports.py             # IAllergenRepository, IIngredientRepository
|   +-- value_objects.py     # AllergenCode (14 EU oficiales), DietaryTag
|   +-- services.py          # AllergenFilterService (filtrado de menu)
|   +-- errors.py            # AllergenNotFoundError
+-- application/
|   +-- dtos.py              # AllergenDTO, DishAllergenInfoDTO, FilterResultDTO
|   +-- get_allergens.py          # GetAllergensUseCase (catalogo oficial)
|   +-- get_dish_allergens.py     # GetDishAllergensUseCase (info de un plato)
|   +-- filter_menu_by_allergens.py  # FilterMenuByAllergensUseCase
|   +-- update_dish_allergens.py     # UpdateDishAllergensUseCase (admin)
+-- infrastructure/
    +-- http/
    |   +-- endpoints.py          # /allergens routes
    +-- persistence/
        +-- sqlmodel_allergen_repo.py     # IAllergenRepository -> SQLModel
        +-- sqlmodel_ingredient_repo.py   # IIngredientRepository -> SQLModel
```

## Entidades

### Allergen
- **Campos**: `code` (AllergenCode), `name`, `description`, `icon_url`, `is_major` (14 EU principales)
- **Inmutable** — catalogo fijo definido por normativa

### Ingredient
- **Campos**: `restaurant_id`, `name`, `allergen_codes[]`, `is_common`
- **Logica**: `contains_allergen(code)` -> bool

### DishAllergenInfo
- **Campos**: `dish_id`, `allergen_codes[]`, `ingredient_ids[]`, `may_contain[]` (trazas), `dietary_tags[]`
- **Logica**:
  - `has_allergen(code)` -> en allergen_codes o may_contain
  - `is_safe_for(excluded_allergens[])` -> no contiene ninguno de los excluidos
  - `matches_diet(dietary_tag)` -> tiene el tag

## Value Objects

### AllergenCode (14 EU oficiales)
```
GLUTEN, CRUSTACEANS, EGGS, FISH, PEANUTS, SOY, DAIRY,
NUTS, CELERY, MUSTARD, SESAME, SULPHITES, LUPIN, MOLLUSCS
```

### DietaryTag
```
VEGETARIAN, VEGAN, GLUTEN_FREE, DAIRY_FREE, NUT_FREE, HALAL, KOSHER
```

## Ports (Interfaces)

### IAllergenRepository
```python
get_all() -> list[Allergen]                    # catalogo completo (14+)
get_by_codes(codes[]) -> list[Allergen]
get_dish_allergen_info(dish_id) -> DishAllergenInfo | None
get_dishes_allergen_info(dish_ids[]) -> list[DishAllergenInfo]
save_dish_allergen_info(info) -> None
```

### IIngredientRepository
```python
get_by_restaurant(restaurant_id) -> list[Ingredient]
get_by_ids(ingredient_ids) -> list[Ingredient]
create(ingredient) -> Ingredient
```

## Servicios de Dominio

### AllergenFilterService (funciones puras)
- `filter_safe_dishes(dishes_info[], excluded_allergens[])` -> list[dish_id]
  - Excluye platos que contienen O pueden contener los alergenos
- `get_allergen_summary(dish_info)` -> dict con categorias (contains, may_contain, free_of)
- `validate_allergen_codes(codes[])` -> raises si codigo no existe

## Use Cases

### GetAllergensUseCase
Retorna catalogo de alergenos con iconos y descripciones.

### GetDishAllergensUseCase
Retorna info completa de alergenos de un plato: alergenos confirmados, trazas, ingredientes, tags dieteticos.

### FilterMenuByAllergensUseCase
**Dependencias**: IAllergenRepository, AllergenFilterService
**Flujo**:
1. Recibir lista de alergenos a excluir
2. Obtener info de alergenos de todos los platos del restaurante
3. Filtrar con AllergenFilterService
4. Retornar IDs de platos seguros

### UpdateDishAllergensUseCase (admin)
**Flujo**: Actualizar alergenos, ingredientes y tags de un plato.

## Dependencias Cross-Domain

| Direccion | Consumidor | Detalle |
|-----------|-----------|---------|
| Provee | Menu | allergen_ids en cada plato |
| Provee | Frontend Menu | Filtros y badges de alergenos |
| Provee | Identity | Preferencias de alergenos del usuario |

## Tests

```
tests/allergen/
+-- test_entities.py              # is_safe_for, has_allergen, matches_diet
+-- test_services.py              # AllergenFilterService
+-- test_filter_menu.py           # Use case
+-- test_get_dish_allergens.py    # Use case
```

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- Los 14 alergenos EU son seed data — cargar en migracion inicial
- `may_contain` (trazas) es critico para alergias severas — destacar en UI
- Considerar campo `severity` para que el usuario indique nivel de restriccion
- Ingredientes gestionados por restaurante — no hay catalogo centralizado (podria haberlo)
- i18n: nombres de alergenos deben estar en el idioma del cliente
