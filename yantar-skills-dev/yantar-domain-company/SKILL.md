---
name: yantar-domain-company
description: >
  Documentacion viva del bounded context Company: empresa, sedes/sucursales,
  branding white-label, horarios, zonas de reparto, y configuracion multi-tenant.
---

# Company Domain

## Proposito

Gestiona la configuracion de cada empresa (restaurante) y sus sedes dentro de Yantar. Incluye branding (logo, colores), informacion de cada sede (direccion, horarios, contacto), zonas de reparto, y opciones de servicio (delivery, pickup). Este dominio es el corazon del modelo white-label y multi-sede.

## Mapa de Archivos

```
apps/backend/src/company/
├── domain/
│   ├── entities/
│   │   ├── company.entity.ts         # Empresa (branding, config global)
│   │   ├── branch.entity.ts          # Sede/sucursal
│   │   └── delivery-zone.entity.ts   # Zona de reparto
│   ├── ports/
│   │   ├── company-repository.port.ts
│   │   ├── branch-repository.port.ts
│   │   └── delivery-zone-repository.port.ts
│   ├── value-objects/
│   │   ├── branding-config.vo.ts     # BrandingConfig, BrandingColors
│   │   ├── service-mode.enum.ts      # PICKUP, DELIVERY
│   │   └── opening-slot.vo.ts        # Horario de apertura
│   ├── services/
│   │   └── availability.service.ts   # Horarios, zonas, sede mas cercana
│   └── errors/
│       ├── company-not-found.error.ts
│       └── branch-not-found.error.ts
├── application/
│   ├── services/
│   │   ├── create-company.service.ts        # Registro de nueva empresa
│   │   ├── get-company-config.service.ts    # Config publica (branding, info)
│   │   ├── update-branding.service.ts       # Admin actualiza branding
│   │   ├── manage-branches.service.ts       # CRUD sedes
│   │   ├── manage-hours.service.ts          # Horarios por sede
│   │   └── manage-delivery-zones.service.ts # Zonas de reparto por sede
│   └── dtos/
│       ├── company.dto.ts
│       ├── branch.dto.ts
│       └── delivery-zone.dto.ts
├── infrastructure/
│   ├── controllers/
│   │   ├── company.controller.ts       # /company routes (publicas)
│   │   └── admin-company.controller.ts # /admin/company routes
│   └── repositories/
│       ├── prisma-company.repository.ts
│       ├── prisma-branch.repository.ts
│       └── prisma-delivery-zone.repository.ts
└── company.module.ts
```

## Entidades

### Company (Empresa)
- **Campos**: `id`, `name`, `slug` (URL-friendly), `description`, `domain` (dominio propio), `branding` (BrandingConfig), `isActive`, `createdAt`
- **Logica**:
  - `getBranding()` → BrandingConfig con defaults para campos vacios
  - `isConfigured()` → tiene branding + al menos 1 sede activa

### Branch (Sede/Sucursal)
- **Campos**: `id`, `companyId`, `name`, `address`, `phone`, `email`, `latitude`, `longitude`, `serviceModes[]` (PICKUP, DELIVERY), `operatingHours[]`, `isActive`
- **Logica**:
  - `isOpenAt(datetime)` → verifica contra operatingHours
  - `supportsDelivery()` → DELIVERY in serviceModes
  - `supportsPickup()` → PICKUP in serviceModes

### DeliveryZone
- **Campos**: `id`, `branchId`, `companyId`, `name`, `postalCodes[]`, `minOrderAmount`, `deliveryFee`, `estimatedTimeMinutes`, `isActive`

## Value Objects

- **BrandingConfig**: `logoUrl`, `faviconUrl`, `fontFamily`, `colors` (BrandingColors), `welcomeMessage`, `appName`
- **BrandingColors**: `primary`, `secondary`, `accent`, `background`, `surface`, `text`, `textMuted`
- **ServiceMode**: `PICKUP`, `DELIVERY`
- **OpeningSlot**: `dayOfWeek` (0-6), `openTime`, `closeTime`

## Ports (Interfaces)

### ICompanyRepository
```typescript
getById(companyId: string): Promise<Company | null>
getBySlug(slug: string): Promise<Company | null>
getByDomain(domain: string): Promise<Company | null>
getAllActive(): Promise<Company[]>  // solo SUPERADMIN
create(company: Company): Promise<Company>
update(company: Company): Promise<Company>
```

### IBranchRepository
```typescript
getByCompany(companyId: string): Promise<Branch[]>
getById(branchId: string, companyId: string): Promise<Branch | null>
create(branch: Branch): Promise<Branch>
update(branch: Branch): Promise<Branch>
```

### IDeliveryZoneRepository
```typescript
getByBranch(branchId: string): Promise<DeliveryZone[]>
findByPostalCode(companyId: string, postalCode: string): Promise<DeliveryZone | null>
create(zone: DeliveryZone): Promise<DeliveryZone>
update(zone: DeliveryZone): Promise<DeliveryZone>
```

## Servicios de Dominio

### AvailabilityService
- `isOpenAt(operatingHours[], datetime)` → bool
- `findNearestBranch(branches[], latitude, longitude)` → Branch | null
- `findBranchForPostalCode(zones[], postalCode)` → Branch | null

## Flujo de Registro de Empresa

1. Dueño se registra (Identity domain → rol RESTAURANT_ADMIN)
2. Crea empresa (nombre, slug)
3. Configura branding (logo, colores)
4. Crea al menos 1 sede (direccion, horarios)
5. Configura zonas de reparto
6. Publica (isActive = true)

## Dependencias Cross-Domain

| Direccion | Consumidor | Detalle |
|-----------|-----------|---------|
| Provee | Todos | companyId, branchId, branding |
| Provee | Order | Sedes, zonas de reparto, serviceModes |
| Provee | Frontend Customer | Tema visual, branding, seleccion de sede |

## Notas

- `domain` es el dominio propio del restaurante (ej: pedir.bocagua.es) — se resuelve en el frontend
- Horarios especiales (festivos, vacaciones) — pendiente
- Geolocalizacion para delivery: actualmente por codigos postales, la seleccion de sede cercana usa lat/lng
