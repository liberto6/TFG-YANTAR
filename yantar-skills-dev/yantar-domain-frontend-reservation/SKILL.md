---
name: yantar-domain-frontend-reservation
description: >
  Documentacion viva del dominio frontend Reservation: UI de reservas,
  selector de fecha/hora, disponibilidad, confirmacion, y recordatorios.
---

# Frontend Reservation Domain

## Proposito

Permite al cliente reservar mesa desde la app: seleccionar fecha, hora, numero de comensales, ver disponibilidad en tiempo real, confirmar reserva, y recibir confirmacion/recordatorio. Tambien muestra reservas activas y permite cancelar.

## Mapa de Archivos

```
yantar-frontend/domains/reservation/
+-- domain/
|   +-- types.ts                        # Reservation, TimeSlot, AvailabilityDay
|   +-- rules.ts                        # canCancel(), isUpcoming(), isPast()
|   +-- rules.test.ts
+-- application/
|   +-- ports.ts                        # IReservationApi
|   +-- use-availability.ts             # Hook de consulta de disponibilidad
|   +-- use-availability.test.ts
|   +-- use-create-reservation.ts       # Hook de creacion de reserva
|   +-- use-create-reservation.test.ts
|   +-- use-my-reservations.ts          # Hook de reservas del usuario
|   +-- use-my-reservations.test.ts
+-- infrastructure/
|   +-- http/
|   |   +-- reservation-api-adapter.ts  # IReservationApi -> HTTP
|   +-- queries/
|       +-- server-queries.ts           # Server-side queries
+-- ui/
    +-- ReservationForm.tsx             # Compound component principal
    +-- ReservationForm.DatePicker.tsx  # Selector de fecha
    +-- ReservationForm.TimePicker.tsx  # Selector de hora (slots disponibles)
    +-- ReservationForm.PartySize.tsx   # Selector de comensales
    +-- ReservationForm.Summary.tsx     # Resumen antes de confirmar
    +-- ReservationForm.Actions.tsx     # Boton confirmar
    +-- MyReservations.tsx              # Lista de reservas del usuario
    +-- ReservationCard.tsx             # Card individual de reserva
```

## Types (domain/types.ts)

### Reservation
```typescript
type Reservation = {
  id: string
  restaurantId: string
  restaurantName: string
  date: string            // YYYY-MM-DD
  timeSlot: TimeSlot
  partySize: number
  status: ReservationStatus
  tableName?: string
  notes?: string
  createdAt: string
}
```

### TimeSlot
```typescript
type TimeSlot = {
  startTime: string       // HH:mm
  endTime: string         // HH:mm
  isAvailable: boolean
}
```

### AvailabilityDay
```typescript
type AvailabilityDay = {
  date: string            // YYYY-MM-DD
  slots: TimeSlot[]
  isClosed: boolean
}
```

### ReservationStatus
```typescript
type ReservationStatus = "PENDING" | "CONFIRMED" | "SEATED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
```

## Rules (Predicados puros)

- `canCancel(reservation)` -> status is PENDING or CONFIRMED, and date > now
- `isUpcoming(reservation)` -> date/time > now AND not terminal
- `isPast(reservation)` -> date/time < now OR terminal
- `isConfirmed(reservation)` -> status === "CONFIRMED"
- `canModify(reservation)` -> canCancel(reservation) (misma logica)

## Ports (application/ports.ts)

### IReservationApi
```typescript
checkAvailability(params: {
  restaurantId: string
  date: string
  partySize: number
}): Promise<AvailabilityDay>

createReservation(params: {
  restaurantId: string
  date: string
  timeSlot: string     // startTime HH:mm
  partySize: number
  customerName: string
  customerPhone: string
  notes?: string
}): Promise<Reservation>

cancelReservation(reservationId: string): Promise<void>

getMyReservations(): Promise<{
  upcoming: Reservation[]
  past: Reservation[]
}>
```

## Hooks

### useAvailability(restaurantId)
**State**: selectedDate, partySize, availability (AvailabilityDay | null), loading
**Handlers**: setDate, setPartySize
**Efecto**: refetch availability cuando cambia date o partySize

### useCreateReservation(restaurantId)
**State**: selectedSlot, customerInfo, submitting, result
**Handlers**: selectSlot, setCustomerInfo, submit
**Flujo**:
1. Usuario selecciona slot disponible
2. Introduce nombre + telefono + notas opcionales
3. Submit -> createReservation API call
4. Retorna reserva confirmada

### useMyReservations()
**State**: upcoming[], past[], loading
**Handlers**: cancelReservation(id)
**Computed**: hasUpcoming, nextReservation

## Compound Components

### ReservationForm
```tsx
<ReservationForm restaurantId={restaurantId}>
  <ReservationForm.DatePicker />
  <ReservationForm.PartySize />
  <ReservationForm.TimePicker />
  <ReservationForm.Summary />
  <ReservationForm.Actions />
</ReservationForm>
```

## Tests

| Archivo | Que prueba |
|---------|-----------|
| `rules.test.ts` | canCancel, isUpcoming, isPast |
| `use-availability.test.ts` | Fetch on date/size change, loading states |
| `use-create-reservation.test.ts` | Submit flow, validation |
| `use-my-reservations.test.ts` | Upcoming/past split, cancel |

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- DatePicker debe respetar horarios del restaurante (no mostrar dias cerrados)
- TimePicker debe mostrar solo slots disponibles (filtro server-side)
- Considerar UX de "mesa preferida" (terraza, interior) — no implementado
- Recordatorios push — depende de integracion con push notifications
- Calendar export (.ics) — pendiente
