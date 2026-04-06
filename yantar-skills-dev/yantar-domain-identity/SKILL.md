---
name: yantar-domain-identity
description: >
  Documentacion viva del bounded context Identity: perfiles de usuario,
  autenticacion JWT via Supabase, roles RBAC, y autorizacion multi-tenant.
---

# Identity Domain

## Proposito

Gestiona usuarios, autenticacion y autorizacion. Define roles (CUSTOMER, RESTAURANT_ADMIN, SUPERADMIN) y reglas RBAC para control de acceso a recursos dentro de cada empresa (tenant). Los clientes estan aislados por empresa.

## Mapa de Archivos

```
apps/backend/src/identity/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts          # User con logica RBAC multi-tenant
│   ├── ports/
│   │   ├── user-repository.port.ts  # IUserRepository
│   │   └── auth-service.port.ts     # IAuthService (Supabase)
│   ├── value-objects/
│   │   └── user-role.enum.ts        # UserRole enum
│   ├── services/
│   │   └── authorization.service.ts # AuthorizationService (raises on denial)
│   └── errors/
│       ├── authorization.error.ts
│       └── user-not-found.error.ts
├── application/
│   ├── services/
│   │   ├── get-current-user.service.ts
│   │   ├── register-user.service.ts
│   │   └── update-profile.service.ts
│   └── dtos/
│       ├── user.dto.ts
│       ├── register.dto.ts
│       └── update-profile.dto.ts
├── infrastructure/
│   ├── controllers/
│   │   └── auth.controller.ts        # /auth, /profile routes
│   ├── repositories/
│   │   └── prisma-user.repository.ts  # IUserRepository → Prisma
│   ├── adapters/
│   │   └── supabase-auth.adapter.ts   # IAuthService → Supabase JWT
│   └── guards/
│       └── auth.guard.ts              # JWT validation guard
└── identity.module.ts
```

## Entidades

### User
- **Campos**: `id`, `email`, `role` (UserRole), `displayName`, `phone`, `avatarUrl`, `companyId` (null para SUPERADMIN, para CUSTOMER = empresa donde se registro), `preferences` (alergenos guardados, etc.)
- **Logica RBAC**:
  - `isCustomer()`, `isRestaurantAdmin()`, `isSuperadmin()` → role checks
  - `canManageMenu(companyId)` → Admin de esa empresa o Superadmin
  - `canManageOrders(companyId)` → Admin de esa empresa o Superadmin
  - `canConfigureCompany(companyId)` → Admin de esa empresa o Superadmin
  - `belongsToCompany(companyId)` → true si es admin/customer de esa empresa

## Value Objects

- **UserRole**: `CUSTOMER`, `RESTAURANT_ADMIN`, `SUPERADMIN`

## Ports (Interfaces)

### IUserRepository
```typescript
getById(userId: string): Promise<User | null>
getByEmail(email: string, companyId: string): Promise<User | null>
getCustomersByCompany(companyId: string): Promise<User[]>
create(user: User): Promise<User>
update(user: User): Promise<User>
```

### IAuthService
```typescript
getUserIdFromToken(token: string): Promise<string | null>  // JWT validation
createAuthUser(email: string, password: string): Promise<string>  // Registration → returns userId
```

## Use Cases

### RegisterUserService
1. Verificar que email no existe en esa empresa
2. Crear auth user en Supabase
3. Crear perfil en BD con rol CUSTOMER (por defecto)
4. Retornar UserDTO

### GetCurrentUserService
1. Validar token → obtener userId
2. Cargar User desde repository
3. Retornar UserDTO

### UpdateProfileService
- Actualizar campos editables: displayName, phone, avatarUrl, preferences

## Dependencias Cross-Domain

| Direccion | Consumidores |
|-----------|-------------|
| Provee | Todos los dominios usan Identity para auth checks |
| Consume | Supabase Auth (infraestructura externa) |

## Notas

- CUSTOMER aislado por empresa: un cliente de "Bocagua" no es cliente de "Casa Pepe"
- Login social (Google, Apple) pendiente
- El registro del RESTAURANT_ADMIN se hace al crear una empresa (flujo de onboarding)
