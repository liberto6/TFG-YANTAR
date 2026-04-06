---
name: yantar-frontend-admin
description: >
  Documentacion del panel de administracion: gestion de carta, sedes,
  branding, horarios, zonas de reparto, alergenos, fidelizacion.
---

# Frontend Admin — Panel de Administracion

## Proposito

Panel web para el RESTAURANT_ADMIN donde gestiona toda la configuracion de su empresa: carta (platos, categorias, variantes, modificadores), sedes, horarios, zonas de reparto, branding, alergenos, y programa de fidelizacion. Tambien accesible para SUPERADMIN (god mode).

## Rutas (App Router)

```
apps/web/src/app/(admin)/
├── dashboard/page.tsx              # Dashboard: resumen del dia
├── menu/
│   ├── page.tsx                    # Lista de platos con acciones
│   ├── [dishId]/page.tsx           # Editar plato (variantes, modificadores, alergenos)
│   ├── new/page.tsx                # Crear plato nuevo
│   └── categories/page.tsx         # Gestionar categorias
├── branches/
│   ├── page.tsx                    # Lista de sedes
│   ├── [branchId]/page.tsx         # Editar sede (horarios, zonas)
│   └── new/page.tsx                # Crear sede
├── orders/page.tsx                 # Historial de pedidos (todas las sedes)
├── loyalty/
│   ├── page.tsx                    # Config del programa de fidelizacion
│   └── rewards/page.tsx            # Gestionar recompensas
├── settings/
│   ├── page.tsx                    # Datos de la empresa
│   ├── branding/page.tsx           # Logo, colores, tipografia
│   └── delivery-zones/page.tsx     # Zonas de reparto por sede
└── layout.tsx                      # Layout con sidebar de navegacion
```

## Features

```
apps/web/src/features/
├── admin-menu/
│   ├── hooks/
│   │   ├── use-dishes.ts            # CRUD platos
│   │   ├── use-categories.ts        # CRUD categorias
│   │   ├── use-variant-groups.ts    # Gestionar variantes de un plato
│   │   └── use-modifier-groups.ts   # Gestionar modificadores de un plato
│   ├── components/
│   │   ├── DishForm.tsx             # Formulario de plato
│   │   ├── DishList.tsx             # Tabla/lista de platos
│   │   ├── CategoryManager.tsx      # CRUD categorias inline
│   │   ├── VariantGroupEditor.tsx   # Editor de grupos de variantes
│   │   ├── ModifierGroupEditor.tsx  # Editor de grupos de modificadores
│   │   ├── AllergenPicker.tsx       # Selector de alergenos por plato
│   │   ├── ImageUploader.tsx        # Subida de imagen del plato
│   │   └── AvailabilityToggle.tsx   # On/off de disponibilidad
│   └── types/
│       └── admin-menu.types.ts
├── admin-branches/
│   ├── hooks/
│   │   ├── use-branches.ts          # CRUD sedes
│   │   ├── use-operating-hours.ts   # Gestionar horarios
│   │   └── use-delivery-zones.ts    # Gestionar zonas de reparto
│   ├── components/
│   │   ├── BranchForm.tsx
│   │   ├── BranchList.tsx
│   │   ├── HoursEditor.tsx          # Editor visual de horarios
│   │   ├── DeliveryZoneEditor.tsx   # Editor de zonas
│   │   └── BranchMap.tsx            # Mapa con ubicacion de sede
│   └── types/
│       └── admin-branches.types.ts
├── admin-branding/
│   ├── hooks/
│   │   └── use-branding.ts
│   ├── components/
│   │   ├── BrandingForm.tsx         # Formulario de branding
│   │   ├── ColorPicker.tsx          # Selector de colores
│   │   ├── LogoUploader.tsx
│   │   └── BrandingPreview.tsx      # Preview en tiempo real
│   └── types/
│       └── admin-branding.types.ts
├── admin-loyalty/
│   ├── hooks/
│   │   ├── use-loyalty-config.ts    # Config de reglas de puntos
│   │   └── use-rewards.ts           # CRUD recompensas
│   ├── components/
│   │   ├── LoyaltyConfigForm.tsx    # Puntos por euro, valor del punto
│   │   ├── RewardForm.tsx           # Crear/editar recompensa
│   │   └── RewardList.tsx
│   └── types/
│       └── admin-loyalty.types.ts
└── admin-dashboard/
    ├── hooks/
    │   └── use-dashboard-stats.ts   # Pedidos del dia, ingresos
    ├── components/
    │   ├── StatsCards.tsx            # KPIs rapidos
    │   ├── OrdersChart.tsx          # Grafico de pedidos
    │   └── RecentOrders.tsx         # Ultimos pedidos
    └── types/
        └── dashboard.types.ts
```

## Consideraciones Tecnicas

- **Desktop-first**: el admin trabaja desde ordenador
- **Sidebar**: navegacion lateral fija con secciones
- **Forms**: formularios complejos (platos con variantes, modificadores, alergenos)
- **Drag & drop**: para reordenar categorias y platos (sortOrder)
- **Preview**: vista previa del branding en tiempo real
- **RBAC**: RESTAURANT_ADMIN ve solo su empresa, SUPERADMIN ve todas
