---
name: yantar-domain-identity
description: >
  Documentacion viva del bounded context Identity: perfiles de usuario,
  autenticacion JWT, roles RBAC, y autorizacion multi-tenant.
---

# Identity Domain

## Proposito

Gestiona usuarios, autenticacion y autorizacion. Define roles (CUSTOMER, RESTAURANT_ADMIN, SUPERADMIN) y reglas RBAC para control de acceso a recursos dentro de cada restaurante (tenant).

## Mapa de Archivos

```
yantar_backend/app/identity/
+-- domain/
|   +-- entities.py          # User con logica RBAC multi-tenant
|   +-- ports.py             # IUserRepository, IAuthService
|   +-- value_objects.py     # UserRole enum
|   +-- services.py          # AuthorizationService (raises on denial)
|   +-- errors.py            # AuthorizationError, UserNotFoundError
+-- application/
|   +-- dtos.py              # UserDTO, RegisterRequest, etc.
|   +-- get_current_user.py  # GetCurrentUserUseCase
|   +-- register_user.py     # RegisterUserUseCase
|   +-- update_profile.py    # UpdateProfileUseCase
+-- infrastructure/
    +-- http/
    |   +-- endpoints.py       # /auth, /profile routes
    |   +-- middleware.py      # JWT validation middleware
    +-- persistence/
    |   +-- sqlmodel_repo.py   # IUserRepository -> SQLModel
    +-- supabase_auth.py       # IAuthService -> Supabase JWT
```

## Entidades

### User
- **Campos**: `email` (EmailStr), `role`, `display_name`, `phone`, `avatar_url`, `restaurant_id` (null para SUPERADMIN y CUSTOMER sin vinculacion), `preferences{}` (alergenos guardados, idioma, etc.)
- **Logica RBAC**:
  - `is_customer()`, `is_restaurant_admin()`, `is_superadmin()` -> role checks
  - `can_manage_menu(restaurant_id)` -> Admin de ese restaurante o Superadmin
  - `can_manage_orders(restaurant_id)` -> Admin de ese restaurante o Superadmin
  - `can_manage_reservations(restaurant_id)` -> Admin de ese restaurante o Superadmin
  - `can_configure_restaurant(restaurant_id)` -> Admin de ese restaurante o Superadmin
  - `can_view_customer_data(customer_id)` -> Customers ven solo lo propio, Admins ven clientes de su restaurante
  - `belongs_to_restaurant(restaurant_id)` -> true si es admin de ese restaurante

## Value Objects

- **UserRole**: `CUSTOMER`, `RESTAURANT_ADMIN`, `SUPERADMIN`

## Ports (Interfaces)

### IUserRepository
```python
get_by_id(user_id) -> User | None
get_by_email(email) -> User | None
get_by_phone(phone) -> User | None
get_customers_by_restaurant(restaurant_id) -> list[User]
create(user) -> User
update(user) -> User
```

### IAuthService
```python
get_user_id_from_token(token) -> UUID | None  # JWT validation
create_auth_user(email, password) -> UUID      # Registration
```

## Servicios de Dominio

### AuthorizationService
Raises `AuthorizationError` on denial:
- `ensure_can_manage_menu(user, restaurant_id)`
- `ensure_can_manage_orders(user, restaurant_id)`
- `ensure_can_manage_reservations(user, restaurant_id)`
- `ensure_can_configure_restaurant(user, restaurant_id)`
- `ensure_can_view_customer_data(user, customer_id)`
- `ensure_belongs_to_restaurant(user, restaurant_id)`

## Use Cases

### GetCurrentUserUseCase
**Dependencias**: IAuthService, IUserRepository
**Flujo**:
1. Validar token -> obtener user_id
2. Cargar User desde repository
3. Retornar UserDTO (id, email, role, display_name, phone, avatar_url, preferences)

### RegisterUserUseCase
**Dependencias**: IAuthService, IUserRepository
**Flujo**:
1. Verificar que email no existe
2. Crear auth user en Supabase
3. Crear perfil en DB con rol CUSTOMER (por defecto)
4. Retornar UserDTO

### UpdateProfileUseCase
**Dependencias**: IUserRepository
**Flujo**: Actualizar campos editables (display_name, phone, avatar_url, preferences)

## Dependencias Cross-Domain

| Direccion | Consumidores |
|-----------|-------------|
| Provee | Todos los dominios usan Identity para auth checks |
| Consume | Supabase Auth (infraestructura externa) |

## Tests

```
tests/identity/
+-- test_entities.py         # RBAC logic, multi-tenant checks
+-- test_services.py         # AuthorizationService
+-- test_get_current_user.py # Use case
+-- test_register_user.py    # Use case
```

## Deuda Tecnica / Notas

- `preferences` es JSONB — considerar tipado fuerte para alergenos guardados
- Un CUSTOMER puede ser cliente de multiples restaurantes — `restaurant_id` en User es para admins
- Login social (Google, Apple) pendiente de implementar
- Phone verification pendiente
