---
name: yantar-frontend-operativo
description: >
  Documentacion de la vista operativa: recepcion de pedidos en tiempo real,
  gestion de estados, diseñada para tablet en cocina/barra.
---

# Frontend Operativo — Vista de Cocina/Barra

## Proposito

Panel en tiempo real para los empleados del restaurante. Reciben pedidos entrantes, los aceptan/rechazan, y mueven entre estados (preparando, listo, entregado). Diseñado para funcionar en una tablet en la cocina o barra. Alertas sonoras cuando llega un pedido nuevo.

## Rutas (App Router)

```
apps/web/src/app/(operativo)/
├── page.tsx                     # Dashboard operativo (pedidos activos)
├── orders/[orderId]/page.tsx    # Detalle de pedido
└── layout.tsx                   # Layout tablet-friendly, sin sidebar
```

## Features

```
apps/web/src/features/
└── operativo/
    ├── hooks/
    │   ├── use-live-orders.ts       # WebSocket: pedidos en tiempo real
    │   ├── use-order-actions.ts     # Aceptar, rechazar, cambiar estado
    │   └── use-sound-alert.ts       # Alerta sonora al llegar pedido
    ├── components/
    │   ├── OrderBoard.tsx           # Tablero con columnas por estado
    │   ├── OrderColumn.tsx          # Columna: Nuevos | Preparando | Listos
    │   ├── OrderCard.tsx            # Tarjeta de pedido con info resumida
    │   ├── OrderCardExpanded.tsx    # Detalle expandido (items, notas, direccion)
    │   ├── AcceptRejectButtons.tsx  # Botones de aceptar/rechazar
    │   ├── StatusTransitionButton.tsx # Boton para mover al siguiente estado
    │   ├── NewOrderAlert.tsx        # Banner/modal de alerta sonora
    │   └── BranchSelector.tsx       # Selector de sede (si admin tiene varias)
    └── types/
        └── operativo.types.ts
```

## Tablero de Pedidos

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│    NUEVOS (3)    │ PREPARANDO (2)  │   LISTOS (1)    │ ENTREGADOS (5)  │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────┐ │
│ │ #42         │ │ │ #40         │ │ │ #38         │ │ │ #35         │ │
│ │ 14:30       │ │ │ 14:15       │ │ │ 14:00       │ │ │ 13:45       │ │
│ │ Delivery    │ │ │ Pickup      │ │ │ Delivery    │ │ │ Pickup      │ │
│ │ 3 items     │ │ │ 2 items     │ │ │ 1 item      │ │ │ 4 items     │ │
│ │ 24.50€      │ │ │ 15.00€      │ │ │ 12.50€      │ │ │ 32.00€      │ │
│ │             │ │ │             │ │ │             │ │ │             │ │
│ │ [Aceptar]   │ │ │ [Listo!]    │ │ │ [Entregado] │ │ │ ✓ Completo  │ │
│ │ [Rechazar]  │ │ │             │ │ │             │ │ │             │ │
│ └─────────────┘ │ └─────────────┘ │ └─────────────┘ │ └─────────────┘ │
│ ┌─────────────┐ │ ┌─────────────┐ │                 │                 │
│ │ #43 ...     │ │ │ #41 ...     │ │                 │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## Flujo

1. Empleado abre vista operativa en tablet
2. Selecciona sede (si hay varias, o auto si solo tiene una)
3. Se conecta al WebSocket → recibe pedidos en tiempo real
4. Llega pedido nuevo → alerta sonora + tarjeta en columna "Nuevos"
5. Empleado click → ve detalle (items con personalizacion, notas, direccion)
6. Acepta o rechaza (con motivo)
7. Al preparar: click "Preparando" → se mueve de columna
8. Al terminar: click "Listo" → se mueve de columna
9. Al entregar/recoger: click "Entregado" → se mueve a completados

## Consideraciones Tecnicas

- **Tablet-friendly**: botones grandes, touch targets minimo 44px
- **WebSocket**: conexion persistente para tiempo real
- **Alerta sonora**: sonido + vibracion al llegar pedido (Web Audio API)
- **Auto-scroll**: columna "Nuevos" siempre visible
- **Filtro por sede**: cada empleado ve solo los pedidos de su sede
- **Offline-resilient**: si pierde conexion WS, intentar reconexion con backoff
- **Sin sidebar**: maximizar espacio para el tablero
- **Colores de estado**: visual claro para cada columna (ej: amarillo nuevo, azul preparando, verde listo)
