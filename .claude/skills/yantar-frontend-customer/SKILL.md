---
name: yantar-frontend-customer
description: >
  Documentacion de la web-app de pedidos del cliente: carta, carrito,
  checkout, seguimiento de pedido, historial. Mobile-first, white-label.
---

# Frontend Customer — Web-App de Pedidos

## Proposito

Web-app mobile-first que permite al cliente del restaurante navegar la carta, personalizar platos, hacer pedidos con delivery o pickup, y seguir el estado en tiempo real. Se accede desde el dominio propio del restaurante (ej: pedir.bocagua.es). Todo el branding es del restaurante — Yantar es invisible.

## Referencia de UX

**pedir.bocagua.es** — flujo principal:
1. Ver carta por categorias
2. Seleccionar plato → personalizar (variantes/modificadores)
3. Agregar al carrito con notas opcionales
4. Checkout: direccion/sede + franja horaria + metodo de pago
5. Seguimiento del estado del pedido

## Rutas (App Router)

```
apps/web/src/app/(customer)/
├── page.tsx                     # Carta principal (categorias + platos)
├── dish/[dishId]/page.tsx       # Detalle del plato con personalizacion
├── cart/page.tsx                # Carrito
├── checkout/page.tsx            # Proceso de pago
├── orders/page.tsx              # Historial de pedidos
├── orders/[orderId]/page.tsx    # Detalle y seguimiento de pedido
├── profile/page.tsx             # Perfil del cliente
└── layout.tsx                   # Layout con branding del restaurante
```

## Features

```
apps/web/src/features/
├── menu/
│   ├── hooks/
│   │   ├── use-menu.ts              # Cargar carta con categorias
│   │   ├── use-dish-detail.ts       # Detalle de plato
│   │   └── use-allergen-filter.ts   # Filtrar por intolerancias
│   ├── components/
│   │   ├── CategoryNav.tsx          # Navegacion por categorias
│   │   ├── DishCard.tsx             # Tarjeta de plato en la carta
│   │   ├── DishDetail.tsx           # Detalle con variantes/modificadores
│   │   ├── VariantSelector.tsx      # Selector de variante (radio)
│   │   ├── ModifierSelector.tsx     # Selector de modificadores (checkboxes)
│   │   ├── AllergenBadge.tsx        # Icono de alergeno
│   │   └── AllergenFilter.tsx       # Panel de filtro por intolerancias
│   └── types/
│       └── menu.types.ts
├── cart/
│   ├── hooks/
│   │   ├── use-cart.ts              # Estado del carrito (add, remove, update qty)
│   │   └── use-cart-totals.ts       # Calculos de subtotal, envio, total
│   ├── components/
│   │   ├── CartDrawer.tsx           # Panel lateral del carrito
│   │   ├── CartItem.tsx             # Linea del carrito
│   │   ├── CartSummary.tsx          # Resumen de precios
│   │   └── CartBadge.tsx            # Contador en el header
│   └── types/
│       └── cart.types.ts
├── checkout/
│   ├── hooks/
│   │   ├── use-checkout.ts          # Flujo de checkout
│   │   └── use-delivery-address.ts  # Gestion de direccion
│   ├── components/
│   │   ├── DeliveryModeSelector.tsx  # Delivery vs Pickup
│   │   ├── BranchSelector.tsx        # Elegir sede (pickup o mapa)
│   │   ├── AddressForm.tsx           # Formulario de direccion
│   │   ├── TimeSlotSelector.tsx      # Elegir franja horaria
│   │   ├── PaymentMethodSelector.tsx # Efectivo / tarjeta (mocked)
│   │   └── OrderSummary.tsx          # Resumen final antes de confirmar
│   └── types/
│       └── checkout.types.ts
├── orders/
│   ├── hooks/
│   │   ├── use-order-status.ts      # Polling + WebSocket del estado
│   │   ├── use-order-history.ts     # Historial paginado
│   │   └── use-reorder.ts           # Repetir pedido anterior
│   ├── components/
│   │   ├── OrderTracker.tsx          # Seguimiento visual del estado
│   │   ├── OrderCard.tsx             # Tarjeta en historial
│   │   └── OrderDetail.tsx           # Detalle completo
│   └── types/
│       └── order.types.ts
└── loyalty/
    ├── hooks/
    │   └── use-loyalty.ts           # Balance, rewards disponibles
    ├── components/
    │   ├── PointsBadge.tsx          # Puntos actuales en header/perfil
    │   ├── RewardsList.tsx          # Recompensas canjeables
    │   └── RedeemAtCheckout.tsx     # Canjear puntos durante checkout
    └── types/
        └── loyalty.types.ts
```

## Flujos Principales

### Seleccion de Sede
1. Cliente accede a `pedir.bocagua.es`
2. Elige modo: **Delivery** o **Pickup**
3. Si Delivery → introduce direccion → sistema asigna sede mas cercana que cubra la zona
4. Si Pickup → muestra listado de sedes (con mapa) → cliente elige

### Hacer un Pedido
1. Navega carta por categorias
2. (Opcional) Filtra por alergenos
3. Selecciona plato → ve detalle
4. Elige variante (si tiene) + modificadores
5. Agrega al carrito (con notas opcionales)
6. Repite para mas platos
7. Va al carrito → revisa
8. Checkout: confirma direccion/sede + elige franja horaria + metodo de pago
9. (Opcional) Canjea puntos de fidelizacion
10. Confirma pedido
11. Ve pantalla de seguimiento con estado en tiempo real

### Repetir Pedido
1. Va a historial
2. Selecciona pedido anterior
3. Click "Repetir pedido"
4. Los items se agregan al carrito
5. Puede modificar antes de confirmar

## Consideraciones Tecnicas

- **Mobile-first**: max-width ~500px para la experiencia principal
- **Branding**: colores, logo, favicon cargados desde la config de la empresa
- **Carrito**: estado en localStorage (persiste entre sesiones)
- **Tiempo real**: WebSocket para actualizaciones de estado del pedido
- **SEO**: Server Components para la carta (indexable por Google)
- **Busqueda**: buscador de platos por nombre
