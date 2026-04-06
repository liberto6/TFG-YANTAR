# Feature Review Checklist — Yantar

## Protocolo de Review

Ejecutar al completar cualquier feature, bugfix o refactor.

### 1. Coupling Grade (A/B/C)

Para cada dominio afectado, contar imports cross-domain **directos** en domain layer:

| Grade | Criterio |
|-------|----------|
| **A** | 0 imports cross-domain en domain/. Toda comunicacion via ports. |
| **B** | 1-2 imports cross-domain en domain/ — justificados (shared types). |
| **C** | 3+ imports cross-domain en domain/ — requiere refactor. |

**Como medir:**
```bash
# Buscar imports de otros modulos en domain/
grep -rn "from '../../" src/{domain}/domain/ | grep -v "from '../../{domain}"
```

### 2. Architecture Compliance (PASS/FAIL)

```bash
pnpm --filter backend test -- --testPathPattern=architecture
```

FAIL = bloqueante, debe corregirse antes de merge.

### 3. Layer Violations

Verificar imports prohibidos:

**Backend domain/ y application/:**
- NO `@nestjs/*` (excepto @Injectable en application)
- NO `@prisma/client`
- NO `@supabase/*`

### 4. Test Coverage

```bash
pnpm --filter backend test -- --coverage --testPathPattern={domain}
```

Objetivo: >80% en domain/ y application/

### 5. Multi-Tenancy Check

Toda query filtra por `companyId` (y `branchId` cuando aplique):

```bash
# Buscar queries Prisma sin filtro de tenant
grep -rn "findMany\|findFirst\|findUnique" src/{domain}/infrastructure/repositories/ | grep -v "companyId"
```

### 6. White-Label Check

```bash
# Buscar colores hardcoded en frontend
grep -rn "bg-red\|bg-blue\|bg-green\|#[0-9a-fA-F]" apps/web/src/ --include="*.tsx"

# Buscar mencion de "Yantar" en UI del customer
grep -rn "Yantar\|yantar" apps/web/src/app/\(customer\)/ --include="*.tsx"
```

---

## Output Format

```markdown
## Feature Review: {nombre de la feature}

**Dominios afectados:** {lista de dominios}
**Fecha:** {fecha}

### Compliance
- Architecture tests: PASS / FAIL
- Layer violations: {count} encontradas
- Multi-tenancy: PASS / FAIL
- White-label: PASS / FAIL

### Coupling por Dominio
| Dominio | Grade | Cross-domain imports | Notas |
|---------|-------|---------------------|-------|
| order | A | 0 | — |

### Test Coverage
| Modulo | Use Cases | Tests | Coverage |
|--------|-----------|-------|----------|
| order/application | 3 | 3 | 85% |

### Recomendaciones
- [ ] {accion recomendada}
- [ ] Actualizar SKILL.md de {dominio}
```

## Cuando Ejecutar

- **Siempre**: al completar una feature o bugfix
- **Parcial** (solo compliance + tests): en refactors internos
- **Completo**: cuando la feature toca 2+ dominios
