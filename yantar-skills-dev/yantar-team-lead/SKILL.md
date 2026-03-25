---
name: yantar-team-lead
description: >
  Orquestador principal para cualquier feature, bugfix o refactor en Yantar.
  Aplica TDD obligatorio, arquitectura hexagonal, compound components,
  y review de acoplamiento por feature.
triggers:
  - Cualquier feature, bugfix o refactor en el proyecto Yantar
---

# Yantar Team Lead

## Vision General

Yantar es una plataforma white-label que permite a restaurantes tener su propia app movil personalizada. El proyecto tiene:

- **Backend**: Python/FastAPI en `yantar_backend/`
- **Frontend**: Next.js/TypeScript en `yantar-frontend/`
- **Mobile**: React Native en `yantar-mobile/`

### Dominios del Sistema

| Componente | Directorio Backend | Directorio Frontend | Descripcion |
|-----------|-------------------|--------------------|----|
| Order | `app/order/` | `domains/order/` | Carrito, pedidos, lifecycle |
| Menu | `app/menu/` | `domains/menu/` | Carta, platos, categorias |
| Identity | `app/identity/` | `domains/identity/` | Usuarios, auth, roles |
| Loyalty | `app/loyalty/` | `domains/profile/` | Puntos, fidelizacion, canjes |
| Restaurant | `app/restaurant/` | — (panel admin) | Config white-label, branding |
| Reservation | `app/reservation/` | `domains/reservation/` | Reservas de mesa |
| Allergen | `app/allergen/` | `domains/menu/` (integrado) | Alergenos, ingredientes, filtros |

---

## Protocolo Obligatorio

### 1. Identificar Dominios Afectados

Antes de escribir codigo, identifica que bounded contexts toca la feature.
Consulta el skill de dominio correspondiente:

**Backend:**
- `/yantar-domain-order` — Carrito, pedidos, estados, modalidades
- `/yantar-domain-menu` — Platos, categorias, precios, personalizaciones
- `/yantar-domain-identity` — Perfiles, auth, roles (CUSTOMER/RESTAURANT_ADMIN/SUPERADMIN)
- `/yantar-domain-loyalty` — Puntos, canjes, reglas de fidelizacion
- `/yantar-domain-restaurant` — Configuracion restaurante, branding, temas
- `/yantar-domain-reservation` — Reservas, disponibilidad, mesas
- `/yantar-domain-allergen` — Alergenos, ingredientes, filtros alimentarios

**Frontend:**
- `/yantar-domain-frontend-order` — UI pedido, carrito, compound components
- `/yantar-domain-frontend-menu` — Navegacion carta, filtros, detalle plato
- `/yantar-domain-frontend-profile` — Perfil usuario, historial, puntos
- `/yantar-domain-frontend-identity` — Auth hooks, registro, login
- `/yantar-domain-frontend-reservation` — UI reservas, calendario, confirmacion

### 2. TDD Obligatorio

Seguir el protocolo en `references/tdd-workflow.md`:
1. Escribir test -> confirmar que FALLA
2. Implementar capa por capa: domain -> application -> infrastructure
3. Ejecutar test -> confirmar que PASA
4. Refactorizar
5. Ejecutar tests de fitness

### 3. Reglas Arquitectonicas

Seguir las reglas en `references/architecture-rules.md`:
- Domain y Application layers NO importan frameworks
- Cross-domain solo a traves de ports
- Infrastructure subdividida: `http/` (endpoints, APIs) + `persistence/` (repos, queries)
- Frontend: compound components con `Object.assign` pattern

### 3.1 Use Cases (Capa Application)

Seguir los patrones en `references/use-case-patterns.md`:
- Un archivo, una clase, un `execute()` — nombre: `{Verb}{Noun}UseCase`
- Constructor recibe ports (interfaces), nunca implementaciones
- DTOs de Request/Result en `dtos.py` — nunca reusar entidades como DTOs
- Errores de dominio, nunca HTTPException
- Frontend: un hook `use-{feature}.ts` por operacion, ports como parametros

### 4. Review por Feature

Al completar una feature, ejecutar el protocolo en `references/review-checklist.md`:
- Scoring de acoplamiento (A/B/C)
- Compliance arquitectonica (pass/fail)
- Cobertura de tests
- Estado de implementacion

### 5. Principios White-Label

Toda feature debe respetar los principios de Yantar:
- **El cliente final NUNCA ve la marca Yantar** — todo branding viene del restaurante
- **Configurabilidad** — colores, logos, textos deben ser configurables por restaurante
- **Multi-tenancy** — cada restaurante tiene datos aislados
- **Mobile-first** — toda UI se optimiza para movil

---

## Gestion de Skills de Dominio

Los skills de dominio son **documentacion viva**. Al implementar una feature que modifique la estructura de un dominio:

1. Actualizar el SKILL.md del dominio afectado
2. Agregar nuevos ports, entidades o use cases a la documentacion
3. Registrar deuda tecnica encontrada
