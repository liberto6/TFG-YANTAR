---
name: yantar-domain-menu
description: >
  Documentacion viva del bounded context Menu: carta del restaurante,
  platos, categorias, precios, personalizaciones disponibles, y fotos.
---

# Menu Domain

## Proposito

Gestiona el catalogo de platos del restaurante, organizado por categorias (entrantes, principales, postres, bebidas, etc.). Cada plato tiene precios, fotos, descripcion, personalizaciones disponibles, y alergenos asociados. El menu es configurable por cada restaurante.

## Mapa de Archivos

```
yantar_backend/app/menu/
+-- domain/
|   +-- entities.py          # Dish, Category, DishCustomizationOption
|   +-- ports.py             # IDishRepository, ICategoryRepository
|   +-- value_objects.py     # DishStatus, Price, DishTag
|   +-- services.py          # MenuValidationService
|   +-- errors.py            # DishNotFoundError, CategoryNotFoundError
+-- application/
|   +-- dtos.py              # DishDTO, CategoryDTO, MenuDTO
|   +-- get_menu.py          # GetMenuUseCase (carta completa)
|   +-- get_dish_detail.py   # GetDishDetailUseCase (con alergenos)
|   +-- create_dish.py       # CreateDishUseCase (admin)
|   +-- update_dish.py       # UpdateDishUseCase (admin)
|   +-- toggle_dish_availability.py  # ToggleDishAvailabilityUseCase
|   +-- manage_categories.py # ManageCategoriesUseCase (CRUD categorias)
+-- infrastructure/
    +-- http/
    |   +-- endpoints.py          # /menu, /dishes routes
    |   +-- image_adapter.py      # Upload de fotos de platos
    +-- persistence/
        +-- sqlmodel_dish_repo.py      # IDishRepository -> SQLModel
        +-- sqlmodel_category_repo.py  # ICategoryRepository -> SQLModel
```

## Entidades

### Dish
- **Campos**: `restaurant_id`, `category_id`, `name`, `description`, `price`, `image_url`, `status`, `sort_order`, `tags[]`, `customization_options[]`, `allergen_ids[]`, `ingredients[]`, `nutritional_info{}`, `preparation_time_minutes`
- **Logica**:
  - `is_available()` -> status == AVAILABLE
  - `publish()` -> DRAFT -> AVAILABLE
  - `unpublish()` -> AVAILABLE -> UNAVAILABLE
  - `archive()` -> -> ARCHIVED
  - `has_allergen(allergen_id)` -> bool
  - `matches_dietary_filter(excluded_allergens[])` -> true si no contiene ninguno

### Category
- **Campos**: `restaurant_id`, `name`, `description`, `sort_order`, `icon`, `is_active`
- **Logica**: `has_dishes()`, `activate()`, `deactivate()`

### DishCustomizationOption
- **Campos**: `name` (ej: "Extra salsa", "Sin cebolla"), `type` (ADD/REMOVE/REPLACE), `extra_price`, `is_default`

## Value Objects

- **DishStatus**: `DRAFT`, `AVAILABLE`, `UNAVAILABLE`, `ARCHIVED`
- **Price**: value object validado >= 0, con `format_display()` -> "12,50 EUR"
- **DishTag**: `VEGETARIAN`, `VEGAN`, `GLUTEN_FREE`, `SPICY`, `NEW`, `POPULAR`, `CHEF_RECOMMENDATION`

## Ports (Interfaces)

### IDishRepository
```python
get_by_id(dish_id, restaurant_id) -> Dish | None
get_by_ids(dish_ids, restaurant_id) -> list[Dish]
get_by_category(category_id, restaurant_id) -> list[Dish]
get_available(restaurant_id) -> list[Dish]
get_filtered(restaurant_id, category_id?, allergen_exclude?, tags?) -> list[Dish]
create(dish) -> Dish
update(dish) -> Dish
update_status(dish_id, status) -> Dish
```

### ICategoryRepository
```python
get_all(restaurant_id) -> list[Category]
get_by_id(category_id, restaurant_id) -> Category | None
create(category) -> Category
update(category) -> Category
reorder(category_ids) -> None
```

## Servicios de Dominio

### MenuValidationService
- `ensure_dish_complete(dish)` -> raises si faltan campos obligatorios (name, price, category)
- `validate_customization_options(options)` -> raises si precios negativos

## Dependencias Cross-Domain

| Direccion | Consumidor | Detalle |
|-----------|-----------|---------|
| Provee | Order | Validacion de platos y precios al crear pedido |
| Provee | Frontend Menu | Datos de carta para navegacion |
| Consume | Allergen | IDs de alergenos asociados a platos |
| Consume | Restaurant | restaurant_id para multi-tenancy |

## Tests

```
tests/menu/
+-- test_entities.py          # Dish state transitions, matches_dietary_filter
+-- test_services.py          # MenuValidationService
+-- test_get_menu.py          # Use case
+-- test_create_dish.py       # Use case
+-- test_toggle_availability.py  # Use case
```

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- `nutritional_info` es JSONB sin schema validado — considerar value object
- Upload de imagenes necesita definir estrategia (Cloud Storage, CDN)
- `sort_order` manual — considerar drag & drop reordering en admin
- Precios en Decimal para evitar errores de punto flotante
