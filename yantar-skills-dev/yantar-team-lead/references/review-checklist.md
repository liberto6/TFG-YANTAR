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
# Backend — buscar imports de otros dominios en domain/
grep -r "from app\." app/{domain}/domain/ | grep -v "from app.{domain}" | grep -v "from app.shared"

# Frontend — buscar imports de otros dominios en domain/
grep -r "from.*@/domains/" domains/{domain}/domain/ | grep -v "from.*@/domains/{domain}"
```

### 2. Architecture Compliance (PASS/FAIL)

```bash
# Backend
cd yantar_backend && python -m pytest tests/test_architecture.py -v

# Frontend
cd yantar-frontend && npx vitest run domains/architecture.test.ts
```

FAIL = bloqueante, debe corregirse antes de merge.

### 3. Layer Violations

Verificar manualmente imports prohibidos:

**Backend domain/ y application/:**
- NO `fastapi`, `starlette`, `httpx`, `supabase`, `postgrest`, `sqlmodel`, `uvicorn`

**Frontend domain/:**
- NO `@supabase`, `createSupabase`, `next/`

**Frontend application/:**
- NO `@supabase/supabase-js`, `createSupabaseServerClient`

### 4. Test Coverage

Cada use case debe tener al menos un test:

```bash
# Backend — listar use cases sin test
for uc in app/{domain}/application/*.py; do
  name=$(basename "$uc" .py)
  if [ "$name" != "__init__" ] && ! find tests/ -name "test_*${name}*" | grep -q .; then
    echo "MISSING TEST: $uc"
  fi
done

# Frontend — listar hooks sin test
for hook in domains/{domain}/application/use-*.ts; do
  test="${hook%.ts}.test.ts"
  if [ ! -f "$test" ]; then
    echo "MISSING TEST: $hook"
  fi
done
```

### 5. Port Contract

Cada adapter en infrastructure/ debe implementar un port ABC del domain/:

- Verificar que cada `class *Adapter` hereda de un port
- Verificar que cada metodo abstracto del port esta implementado

### 6. Multi-Tenancy Check

Verificar que toda query de datos filtra por `restaurant_id`:

```bash
# Buscar queries sin filtro de tenant
grep -rn "select(" app/{domain}/infrastructure/persistence/ | grep -v "restaurant_id"
```

### 7. White-Label Check

Verificar que no hay textos, colores o logos hardcoded:

```bash
# Frontend — buscar colores hardcoded
grep -rn "bg-\(red\|blue\|green\|yellow\)" domains/{domain}/ui/
grep -rn "#[0-9a-fA-F]\{3,6\}" domains/{domain}/ui/
```

---

## Output Format

Al completar el review, generar este reporte:

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
| menu | A | 0 | — |

### Test Coverage
| Modulo | Use Cases | Tests | Coverage |
|--------|-----------|-------|----------|
| order/application | 3 | 3 | 100% |

### Recomendaciones
- [ ] {accion recomendada}
- [ ] Actualizar SKILL.md de {dominio} con nuevos ports/entidades
```

---

## Cuando Ejecutar

- **Siempre**: al completar una feature o bugfix
- **Parcial** (solo compliance + tests): en refactors internos de un dominio
- **Completo**: cuando la feature toca 2+ dominios
