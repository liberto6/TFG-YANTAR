---
name: yantar-domain-restaurant
description: >
  Documentacion viva del bounded context Restaurant: configuracion del
  restaurante, branding white-label, horarios, mesas, y panel de administracion.
---

# Restaurant Domain

## Proposito

Gestiona la configuracion de cada restaurante dentro de la plataforma Yantar. Incluye branding (logo, colores, tipografia), informacion del local (direccion, horarios, contacto), configuracion de mesas, y opciones de servicio (delivery, pickup, dine-in). Este dominio es el corazon del modelo white-label.

## Mapa de Archivos

```
yantar_backend/app/restaurant/
+-- domain/
|   +-- entities.py          # Restaurant, Table, OperatingHours, DeliveryZone
|   +-- ports.py             # IRestaurantRepository, ITableRepository
|   +-- value_objects.py     # BrandingConfig, BrandingColors, ServiceMode, OpeningSlot
|   +-- services.py          # AvailabilityService (horarios, capacidad)
|   +-- errors.py            # RestaurantNotFoundError, InvalidConfigError
+-- application/
|   +-- dtos.py              # RestaurantConfigDTO, BrandingDTO, etc.
|   +-- get_restaurant_config.py    # GetRestaurantConfigUseCase (publico)
|   +-- update_branding.py          # UpdateBrandingUseCase (admin)
|   +-- update_info.py              # UpdateRestaurantInfoUseCase (admin)
|   +-- manage_tables.py            # ManageTablesUseCase (admin)
|   +-- manage_hours.py             # ManageOperatingHoursUseCase (admin)
|   +-- manage_delivery_zones.py    # ManageDeliveryZonesUseCase (admin)
+-- infrastructure/
    +-- http/
    |   +-- endpoints.py          # /restaurant routes
    |   +-- admin_endpoints.py    # /admin/restaurant routes
    +-- persistence/
        +-- sqlmodel_restaurant_repo.py  # IRestaurantRepository -> SQLModel
        +-- sqlmodel_table_repo.py       # ITableRepository -> SQLModel
```

## Entidades

### Restaurant
- **Campos**: `name`, `slug` (URL-friendly), `description`, `address`, `phone`, `email`, `website`, `branding` (BrandingConfig), `service_modes[]` (DINE_IN, PICKUP, DELIVERY), `operating_hours[]`, `delivery_zones[]`, `is_active`, `subscription_tier`, `metadata{}`
- **Logica**:
  - `is_open_at(datetime)` -> verifica contra operating_hours
  - `supports_delivery()` -> DELIVERY in service_modes
  - `supports_pickup()` -> PICKUP in service_modes
  - `supports_dine_in()` -> DINE_IN in service_modes
  - `get_branding()` -> BrandingConfig con defaults para campos vacios

### Table
- **Campos**: `restaurant_id`, `number`, `capacity` (comensales), `zone` (terraza, interior, etc.), `is_active`, `qr_code_url`
- **Logica**: `can_seat(party_size)` -> capacity >= party_size

### OperatingHours
- **Campos**: `day_of_week` (0-6), `open_time`, `close_time`, `is_closed` (para dias especiales)

### DeliveryZone
- **Campos**: `restaurant_id`, `name`, `postal_codes[]`, `min_order_amount`, `delivery_fee`, `estimated_time_minutes`, `is_active`

## Value Objects

- **BrandingConfig** (frozen):
  - `logo_url`, `favicon_url`, `font_family`, `colors` (BrandingColors)
  - `welcome_message`, `app_name` (ej: "Casa Pepe App")
  - `social_links{}` (instagram, facebook, etc.)
- **BrandingColors** (frozen):
  - `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `text_muted`
- **ServiceMode**: `DINE_IN`, `PICKUP`, `DELIVERY`
- **OpeningSlot**: `day_of_week`, `open_time`, `close_time`

## Ports (Interfaces)

### IRestaurantRepository
```python
get_by_id(restaurant_id) -> Restaurant | None
get_by_slug(slug) -> Restaurant | None
get_all_active() -> list[Restaurant]  # solo SUPERADMIN
update(restaurant) -> Restaurant
update_branding(restaurant_id, branding) -> Restaurant
```

### ITableRepository
```python
get_all(restaurant_id) -> list[Table]
get_by_id(table_id, restaurant_id) -> Table | None
get_available(restaurant_id, party_size, datetime) -> list[Table]
create(table) -> Table
update(table) -> Table
```

## Servicios de Dominio

### AvailabilityService (funciones puras)
- `is_open_at(operating_hours[], datetime)` -> bool
- `get_available_slots(operating_hours[], date, slot_duration_minutes)` -> list[TimeSlot]
- `can_deliver_to(delivery_zones[], postal_code)` -> DeliveryZone | None

## Dependencias Cross-Domain

| Direccion | Consumidor | Detalle |
|-----------|-----------|---------|
| Provee | Todos | restaurant_id, branding, config |
| Provee | Order | Modalidades de servicio, zonas de delivery |
| Provee | Frontend | Tema visual, branding |

## Tests

```
tests/restaurant/
+-- test_entities.py              # is_open_at, supports_delivery, etc.
+-- test_services.py              # AvailabilityService
+-- test_get_restaurant_config.py # Use case
+-- test_update_branding.py       # Use case
+-- test_manage_tables.py         # Use case
```

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- QR codes para mesas: generacion automatica al crear mesa
- Horarios especiales (festivos, vacaciones) — pendiente
- Geolocalizacion para delivery zones — actualmente solo postal codes
- `subscription_tier` para futuro modelo freemium de Yantar (no implementado aun)
