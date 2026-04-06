---
name: yantar-frontend-identity
description: >
  Documentacion del frontend de autenticacion: login, registro, perfil.
  Compartido entre las vistas customer, admin y operativo.
---

# Frontend Identity — Auth Compartido

## Proposito

Componentes y hooks de autenticacion compartidos entre todas las vistas (customer, admin, operativo). Gestiona login, registro, perfil, y proteccion de rutas segun rol.

## Rutas (App Router)

```
apps/web/src/app/(auth)/
├── login/page.tsx               # Login (email + password)
├── register/page.tsx            # Registro de cliente
├── register-business/page.tsx   # Registro de empresa (admin)
└── layout.tsx                   # Layout minimo
```

## Features

```
apps/web/src/features/
└── auth/
    ├── hooks/
    │   ├── use-auth.ts              # Estado de auth (user, isLoggedIn, logout)
    │   ├── use-login.ts             # Mutation de login
    │   ├── use-register.ts          # Mutation de registro
    │   └── use-require-role.ts      # Guard: redirige si no tiene rol
    ├── components/
    │   ├── LoginForm.tsx
    │   ├── RegisterForm.tsx         # Registro de customer
    │   ├── BusinessRegisterForm.tsx # Registro de empresa + admin
    │   ├── ProfileForm.tsx          # Editar perfil
    │   ├── AuthGuard.tsx            # Wrapper que protege rutas
    │   └── RoleGuard.tsx            # Wrapper que verifica rol
    ├── context/
    │   └── auth-context.tsx         # Provider de auth (Supabase)
    ├── lib/
    │   └── supabase-client.ts       # Supabase client (solo auth)
    └── types/
        └── auth.types.ts
```

## Flujos

### Registro de Cliente (Customer)
1. Accede a `/register` desde la web-app del restaurante
2. Introduce: email, password, nombre, telefono
3. Se crea cuenta en Supabase Auth + perfil en BD (rol CUSTOMER, companyId = empresa actual)
4. Auto-login → redirige a la carta

### Registro de Empresa (Admin)
1. Accede a `/register-business`
2. Introduce: email, password, nombre de empresa
3. Se crea cuenta en Supabase Auth + perfil en BD (rol RESTAURANT_ADMIN)
4. Se crea Company con datos basicos
5. Redirige a panel admin para completar configuracion

### Login
1. Email + password
2. Supabase Auth valida → JWT
3. Backend identifica usuario y rol
4. Redirige segun rol:
   - CUSTOMER → carta del restaurante
   - RESTAURANT_ADMIN → panel admin
   - SUPERADMIN → panel superadmin

## Consideraciones Tecnicas

- **Supabase Auth**: unico uso de Supabase SDK en frontend
- **JWT**: almacenado en cookie httpOnly (gestionado por Supabase)
- **Auth Context**: Provider en el root layout, disponible en todas las vistas
- **Guards**: AuthGuard para rutas protegidas, RoleGuard para rutas por rol
- **Token refresh**: automatico via Supabase SDK
