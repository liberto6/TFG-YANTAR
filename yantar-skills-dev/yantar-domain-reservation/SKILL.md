---
name: yantar-domain-reservation
description: >
  Documentacion viva del bounded context Reservation: reservas de mesa,
  disponibilidad, gestion de turnos, confirmaciones y recordatorios.
---

# Reservation Domain

## Proposito

Permite a los clientes reservar mesa directamente desde la app, seleccionando fecha, hora y numero de comensales. El restaurante gestiona la disponibilidad desde su panel de administracion.

## Mapa de Archivos

```
yantar_backend/app/reservation/
+-- domain/
|   +-- entities.py          # Reservation (state machine)
|   +-- ports.py             # IReservationRepository, ITableChecker, INotificationService
|   +-- value_objects.py     # ReservationStatus, TimeSlot, PartySize
|   +-- services.py          # AvailabilityCalculator (logica de disponibilidad)
|   +-- errors.py            # NoTablesAvailableError, ReservationConflictError
+-- application/
|   +-- dtos.py              # CreateReservationRequest/Result, AvailabilityDTO, etc.
|   +-- check_availability.py    # CheckAvailabilityUseCase
|   +-- create_reservation.py    # CreateReservationUseCase
|   +-- confirm_reservation.py   # ConfirmReservationUseCase (restaurante confirma)
|   +-- cancel_reservation.py    # CancelReservationUseCase
|   +-- get_reservations.py      # GetReservationsUseCase (historial)
+-- infrastructure/
    +-- http/
    |   +-- endpoints.py             # /reservations routes
    |   +-- notification_adapter.py  # Confirmaciones y recordatorios (email/push)
    +-- persistence/
        +-- sqlmodel_reservation_repo.py  # IReservationRepository -> SQLModel
```

## Entidades

### Reservation
- **Campos**: `customer_id`, `restaurant_id`, `table_id?` (asignado por restaurante), `date`, `time_slot` (TimeSlot), `party_size`, `status`, `customer_name`, `customer_phone`, `notes`, `created_at`, `confirmed_at`, `cancelled_at`, `cancellation_reason`
- **Estados**: `PENDING -> CONFIRMED -> SEATED -> COMPLETED` (o `CANCELLED` / `NO_SHOW`)
- **Logica**:
  - `confirm(table_id?)` -> PENDING -> CONFIRMED
  - `seat()` -> CONFIRMED -> SEATED (cliente llega)
  - `complete()` -> SEATED -> COMPLETED
  - `cancel(reason)` -> desde PENDING o CONFIRMED
  - `mark_no_show()` -> CONFIRMED -> NO_SHOW
  - `is_cancellable()` -> true si PENDING o CONFIRMED
  - `is_upcoming()` -> date/time > now AND not terminal
  - `is_past()` -> date/time < now OR terminal state
  - `can_be_modified()` -> PENDING o CONFIRMED, y fecha > now

## Value Objects

- **ReservationStatus**: `PENDING`, `CONFIRMED`, `SEATED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- **TimeSlot**: `start_time`, `end_time` (tipicamente 1.5-2h slots)
- **PartySize**: value object validado 1-20 comensales

## Ports (Interfaces)

### IReservationRepository
```python
get_by_id(reservation_id, restaurant_id) -> Reservation | None
get_by_customer(customer_id, restaurant_id) -> list[Reservation]
get_upcoming_by_customer(customer_id) -> list[Reservation]  # cross-restaurant
get_by_date(restaurant_id, date) -> list[Reservation]
get_by_date_range(restaurant_id, start_date, end_date) -> list[Reservation]
save(reservation) -> Reservation
update(reservation) -> Reservation
```

### ITableChecker (cross-domain — del dominio Restaurant)
```python
get_available_tables(restaurant_id, date, time_slot, party_size) -> list[Table]
is_restaurant_open(restaurant_id, datetime) -> bool
```

### INotificationService
```python
send_confirmation(reservation) -> None
send_reminder(reservation, hours_before) -> None
send_cancellation(reservation) -> None
```

## Servicios de Dominio

### AvailabilityCalculator (funciones puras)
- `get_available_slots(tables[], existing_reservations[], date, party_size)` -> list[TimeSlot]
  - Calcula slots libres considerando capacidad de mesas y reservas existentes
- `find_best_table(tables[], party_size)` -> Table
  - Asigna la mesa mas pequena que quepa el grupo (optimiza ocupacion)
- `calculate_slot_end(start_time, default_duration_minutes=120)` -> time

## Use Cases

### CheckAvailabilityUseCase
**Dependencias**: IReservationRepository, ITableChecker
**Flujo**:
1. Verificar que restaurante esta abierto en la fecha
2. Obtener mesas disponibles para party_size
3. Obtener reservas existentes para la fecha
4. Calcular slots disponibles
5. Retornar lista de TimeSlots disponibles

### CreateReservationUseCase
**Dependencias**: IReservationRepository, ITableChecker, INotificationService
**Flujo**:
1. Verificar disponibilidad (slot + party_size)
2. Crear reserva en estado PENDING
3. Enviar notificacion al restaurante
4. Enviar confirmacion al cliente (si auto-confirm activo)
5. Retornar reservation con detalles

### ConfirmReservationUseCase
**Dependencias**: IReservationRepository, INotificationService
**Flujo**: Restaurante confirma -> asigna mesa -> notifica cliente

### CancelReservationUseCase
**Dependencias**: IReservationRepository, INotificationService
**Flujo**: Validar cancellable -> cancelar -> notificar

## Dependencias Cross-Domain

| Direccion | Port | Dominio Proveedor |
|-----------|------|--------------------|
| Consume | `ITableChecker` | Restaurant (mesas, horarios) |
| Provee | Reservas del cliente | Frontend Profile (historial) |
| Provee | Puntos por reserva | Loyalty (otorgar puntos por visita) |

## Tests

```
tests/reservation/
+-- test_entities.py              # State machine, is_cancellable, is_upcoming
+-- test_services.py              # AvailabilityCalculator
+-- test_check_availability.py    # Use case
+-- test_create_reservation.py    # Use case
+-- test_cancel_reservation.py    # Use case
```

## Deuda Tecnica / Notas

- Dominio nuevo — sin legacy
- Auto-confirm configurable por restaurante (some quieren revisar manualmente)
- Recordatorios automaticos (24h y 2h antes) — necesita scheduler/cron
- Politica de no-show (ej: penalizar tras 3 no-shows) — pendiente
- Integracion con Google Calendar / Apple Calendar — export ICS pendiente
- Overbooking inteligente — considerar porcentaje de no-show historico
