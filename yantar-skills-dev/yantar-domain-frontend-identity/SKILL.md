---
name: yantar-domain-frontend-identity
description: >
  Documentacion viva del dominio frontend Identity: autenticacion,
  registro, login, perfil de usuario, y hooks de auth.
---

# Frontend Identity Domain

## Proposito

Gestiona la autenticacion del usuario en el frontend: registro, login (email/telefono/social), sesion activa, y datos basicos del perfil. Provee hooks de auth reutilizables por todos los demas dominios.

## Mapa de Archivos

```
yantar-frontend/domains/identity/
+-- domain/
|   +-- types.ts                  # UserRole, UserProfile types
+-- application/
|   +-- ports.ts                  # IAuthAdapter
|   +-- use-auth.ts              # Hook de autenticacion (login/register/logout)
|   +-- use-auth.test.ts
|   +-- use-profile.ts           # Hook de perfil autenticado
|   +-- use-profile.test.ts
+-- infrastructure/
|   +-- http/
|   |   +-- auth-adapter.ts      # IAuthAdapter -> Supabase Auth
|   +-- queries/
|       +-- server-queries.ts    # Server-side profile queries
+-- ui/
    +-- LoginForm.tsx            # Formulario de login
    +-- RegisterForm.tsx         # Formulario de registro
    +-- AuthGuard.tsx            # Wrapper que redirige si no autenticado
```

## Types (domain/types.ts)

### UserRole
```typescript
type UserRole = "customer" | "restaurant_admin" | "superadmin"
```

### UserProfile
```typescript
type UserProfile = {
  id: string
  email: string
  role: UserRole
  displayName: string | null
  phone: string | null
  avatarUrl: string | null
  restaurantId: string | null   // solo para restaurant_admin
  preferences: UserPreferences
}
```

### UserPreferences
```typescript
type UserPreferences = {
  excludedAllergens: AllergenCode[]
  language: string
  notificationsEnabled: boolean
}
```

## Ports (application/ports.ts)

### IAuthAdapter
```typescript
login(email: string, password: string): Promise<AuthResult>
register(data: RegisterData): Promise<AuthResult>
loginWithPhone(phone: string, otp: string): Promise<AuthResult>
loginWithSocial(provider: "google" | "apple"): Promise<AuthResult>
logout(): Promise<void>
getCurrentUser(): Promise<UserProfile | null>
getCurrentUserId(): Promise<string>
onAuthStateChange(callback: (user: UserProfile | null) => void): () => void
```

## Hooks

### useAuth()
**State**: `{ user: UserProfile | null, loading: boolean, isAuthenticated: boolean }`
**Handlers**: login, register, logout, loginWithPhone, loginWithSocial
**Flujo**:
1. On mount: check sesion activa via `getCurrentUser()`
2. Subscribe a cambios de auth state
3. Expone user + handlers

### useProfile()
**State**: `{ profile: UserProfile | null, loading: boolean }`
**Flujo**: Carga perfil completo del usuario autenticado incluyendo preferencias.

## Server Queries (infrastructure/queries/server-queries.ts)

### getProfileById(userId) -> UserProfile
Query directa a tabla `profiles`.

### getRestaurantCustomers(restaurantId) -> CustomerSummary[]
Para panel admin: lista de clientes del restaurante con stats basicos.

## Tests

| Archivo | Que prueba |
|---------|-----------|
| `use-auth.test.ts` | Login flow, register, logout, state changes |
| `use-profile.test.ts` | Profile loading, preferences |

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- Login social (Google, Apple) pendiente de configurar en Supabase
- Phone OTP pendiente de implementar
- AuthGuard necesita manejar redirects post-login (volver a donde estaba)
- Considerar refresh token rotation para seguridad
