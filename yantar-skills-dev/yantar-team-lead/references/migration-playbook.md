# Implementation Playbook — Yantar

## Modelo de Implementacion

Yantar es un proyecto greenfield (sin legacy). Cada dominio se implementa siguiendo arquitectura hexagonal desde el inicio. No hay flag de migracion — todo es v2 (hexagonal) desde el dia uno.

---

## Inventario de Dominios y Endpoints

### Backend API

| Dominio | Prefix | Endpoints clave | Estado |
|---------|--------|----------------|--------|
| Menu | `/menu` | GET /menu/{restaurant_id}, GET /dishes/{id}, POST /dishes (admin) | Por implementar |
| Order | `/orders` | POST /orders, GET /orders/{id}, PATCH /orders/{id}/status | Por implementar |
| Reservation | `/reservations` | POST /reservations, GET /availability, DELETE /reservations/{id} | Por implementar |
| Loyalty | `/loyalty` | GET /loyalty/balance, POST /loyalty/redeem, GET /loyalty/rewards | Por implementar |
| Identity | `/auth`, `/profile` | POST /auth/register, POST /auth/login, GET /profile | Por implementar |
| Restaurant | `/restaurant` | GET /restaurant/{id}/config, PUT /restaurant/{id}/branding (admin) | Por implementar |
| Allergen | `/allergens` | GET /allergens, GET /dishes/{id}/allergens, POST /dishes/{id}/allergens (admin) | Por implementar |

### Frontend Domains

| Dominio | Directorio | Componentes clave | Estado |
|---------|-----------|-------------------|--------|
| Menu | `domains/menu/` | MenuBrowser, DishCard, DishDetail | Por implementar |
| Order | `domains/order/` | Cart, OrderStatus | Por implementar |
| Reservation | `domains/reservation/` | ReservationForm, MyReservations | Por implementar |
| Profile | `domains/profile/` | LoyaltyCard, OrderHistory, Preferences | Por implementar |
| Identity | `domains/identity/` | LoginForm, RegisterForm, AuthGuard | Por implementar |

---

## Procedimiento de Implementacion de un Dominio

### Paso 1: Analizar requisitos del dominio

Leer el SKILL.md del dominio. Entender:
- Entidades y sus estados
- Ports necesarios
- Use cases a implementar
- Dependencias cross-domain

### Paso 2: Crear domain layer

```
app/{domain}/domain/
  entities.py      -> Entidades con logica de negocio
  value_objects.py -> Enums, tipos
  ports.py         -> Interfaces para cada dependencia externa
  services.py      -> Logica que no pertenece a una entidad (opcional)
  errors.py        -> Errores de dominio
```

**Regla**: domain/ NO importa frameworks. Solo stdlib + pydantic + tipos propios.

### Paso 3: Crear application layer

```
app/{domain}/application/
  dtos.py          -> Request/Result DTOs
  {verb}_{noun}.py -> Un use case por operacion
```

El use case recibe ports por constructor (dependency injection) y orquesta la logica.

### Paso 4: Crear infrastructure layer

```
app/{domain}/infrastructure/
  http/
    endpoints.py       -> FastAPI router
    {name}_adapter.py  -> Adaptadores de servicios externos
  persistence/
    {name}_repo.py     -> Implementacion de IRepository (SQLModel + AsyncSession)
```

### Paso 5: Registrar router

En `app/api/router.py`:

```python
from app.{domain}.infrastructure.http.endpoints import router as {name}_router

router.include_router({name}_router, prefix="/{path}", tags=["{tag}"])
```

### Paso 6: Implementar frontend domain

```
domains/{domain}/
  domain/types.ts        -> Tipos puros
  domain/rules.ts        -> Predicados puros
  application/ports.ts   -> Interfaces
  application/use-*.ts   -> Hooks
  infrastructure/http/   -> API adapters
  ui/                    -> Componentes
```

### Paso 7: Tests

1. Test unitario del use case (mock de ports)
2. Test de fitness (`test_architecture.py`) — verificar que pasa
3. Test del endpoint (si aplica)
4. Test de hooks frontend
5. Test de rules/predicados

---

## Orden de Implementacion Recomendado

Basado en dependencias entre dominios:

1. **Identity** — todos los demas dominios dependen de auth
2. **Restaurant** — configuracion base, branding, mesas
3. **Allergen** — catalogo de alergenos (seed data)
4. **Menu** — necesita Restaurant y Allergen
5. **Order** — necesita Menu y opcionalmente Loyalty
6. **Loyalty** — necesita Order (para award points)
7. **Reservation** — necesita Restaurant (mesas, horarios)

**Frontend en paralelo**: Identity y Menu pueden empezar tan pronto como sus APIs backend esten listas.

---

## Reglas Importantes

1. **Arquitectura hexagonal desde el inicio** — no crear endpoints "rapidos" sin capas
2. **Multi-tenancy siempre** — toda query filtra por `restaurant_id`
3. **White-label siempre** — ningun texto, color o logo hardcoded
4. **Mobile-first** — toda UI optimizada para movil
5. **Tests de fitness corren siempre** — domain/application no importan frameworks
6. **Cada dominio tiene su SKILL.md** — actualizar al implementar
