#!/usr/bin/env bash
# Yantar — script de arranque local end-to-end.
# Levanta Postgres en Docker, aplica migraciones Prisma, ejecuta el seed,
# genera el cliente Prisma y arranca backend + frontend con turbo.
#
# Uso (desde la raiz del monorepo):
#   ./start.sh            arranque completo (instala, DB, dev)
#   ./start.sh --reset    borra el schema y vuelve a sembrar
#   ./start.sh --no-dev   prepara todo pero no lanza pnpm dev
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER="yantar-postgres"
DB_NAME="yantar_dev"
DB_USER="yantar"

RESET=0
START_DEV=1
for arg in "$@"; do
  case "$arg" in
    --reset)   RESET=1 ;;
    --no-dev)  START_DEV=0 ;;
    *) echo "Argumento desconocido: $arg" >&2; exit 2 ;;
  esac
done

echo "==> Yantar dev bootstrap"

# 1) Dependencias
#
# Workaround Windows: si el usuario no tiene "Modo de desarrollador" activado,
# Windows bloquea junctions con "untrusted mount point" y pnpm no puede crear
# node_modules normalmente. En ese caso instalamos en modo plano
# (shamefully-hoist + copy) quitando temporalmente @yantar/shared del workspace
# y copiamos packages/shared como directorio real dentro de cada app.
HAVE_ROOT_DEPS=0
HAVE_SHARED_BE=0
HAVE_SHARED_WEB=0
[ -f "$APP_DIR/node_modules/@nestjs/core/package.json" ] && HAVE_ROOT_DEPS=1
[ -f "$APP_DIR/apps/backend/node_modules/@yantar/shared/dist/index.js" ] && HAVE_SHARED_BE=1
[ -f "$APP_DIR/apps/web/node_modules/@yantar/shared/dist/index.js" ] && HAVE_SHARED_WEB=1

if [ "$HAVE_ROOT_DEPS" = "0" ] || [ "$HAVE_SHARED_BE" = "0" ] || [ "$HAVE_SHARED_WEB" = "0" ]; then
  echo "==> Instalando dependencias..."

  # Detectar Windows
  IS_WINDOWS=0
  case "${OS:-}" in *Windows*|*windows*) IS_WINDOWS=1 ;; esac
  case "$(uname -s 2>/dev/null || echo unknown)" in MINGW*|MSYS*|CYGWIN*) IS_WINDOWS=1 ;; esac

  BP="$APP_DIR/apps/backend/package.json"
  WP="$APP_DIR/apps/web/package.json"

  if [ "$IS_WINDOWS" = "1" ]; then
    echo "    (Windows: instalacion plana + copia de @yantar/shared)"

    # 1a) Backup y quitar @yantar/shared
    cp "$BP" "$BP.bak"
    cp "$WP" "$WP.bak"
    node -e '
      const fs = require("fs");
      for (const p of process.argv.slice(1)) {
        const j = JSON.parse(fs.readFileSync(p, "utf8"));
        if (j.dependencies && j.dependencies["@yantar/shared"]) delete j.dependencies["@yantar/shared"];
        fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
      }
    ' "$BP" "$WP"

    # 1b) Limpiar node_modules
    rm -rf "$APP_DIR/node_modules" "$APP_DIR/apps/backend/node_modules" \
           "$APP_DIR/apps/web/node_modules" "$APP_DIR/packages/shared/node_modules"

    # 1c) Instalar plano
    export npm_config_node_linker=hoisted
    export npm_config_shamefully_hoist=true
    export npm_config_package_import_method=copy
    (cd "$APP_DIR" && pnpm install --no-frozen-lockfile --child-concurrency=1)

    # 1d) Restaurar package.json
    mv "$BP.bak" "$BP"
    mv "$WP.bak" "$WP"

    # 1e) Inyectar @yantar/shared como directorio real
    SRC="$APP_DIR/packages/shared"
    for app in apps/backend apps/web; do
      DEST="$APP_DIR/$app/node_modules/@yantar/shared"
      mkdir -p "$(dirname "$DEST")"
      rm -rf "$DEST"
      mkdir -p "$DEST"
      cp "$SRC/package.json" "$DEST/"
      cp -r "$SRC/dist" "$DEST/"
    done
    echo "    @yantar/shared inyectado en apps/backend y apps/web."
  else
    (cd "$APP_DIR" && pnpm install)
  fi
else
  echo "==> node_modules detectado con @yantar/shared, salto pnpm install"
fi

# 2) Postgres en Docker
echo "==> Levantando Postgres (docker compose up -d)..."
(cd "$APP_DIR" && docker compose up -d)

# 3) Esperar healthcheck
echo "==> Esperando a que Postgres esté listo..."
for i in $(seq 1 60); do
  if docker exec "$CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
    echo "    Postgres listo."
    break
  fi
  sleep 1
  if [ "$i" -eq 60 ]; then
    echo "    Timeout esperando Postgres" >&2; exit 1
  fi
done

# 4) Reset opcional: borra el schema entero para resembrar
if [ "$RESET" = "1" ]; then
  echo "==> --reset: borrando schema public..."
  docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
    -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $DB_USER;" \
    >/dev/null
fi

# 5) Aplicar migraciones (idempotente)
echo "==> Aplicando migraciones Prisma..."
(cd "$APP_DIR/apps/backend" && pnpm exec prisma migrate deploy)

# 6) Generar Prisma Client
echo "==> Generando Prisma Client..."
(cd "$APP_DIR/apps/backend" && pnpm exec prisma generate >/dev/null)

# 7) Seed (idempotente: usa upsert, asi que es seguro reejecutarlo)
COMPANIES=$(docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc \
  "SELECT count(*) FROM companies;" 2>/dev/null || echo 0)
COMPANIES=$(echo "$COMPANIES" | tr -d '[:space:]')

if [ "$RESET" = "1" ] || [ "${COMPANIES:-0}" = "0" ]; then
  echo "==> Sembrando datos de demo (Pizzeria Napoli)..."
  (cd "$APP_DIR/apps/backend" && pnpm exec prisma db seed)
else
  echo "==> Ya hay datos en la DB ($COMPANIES empresas). Salto seed. Usa --reset para resembrar."
fi

# 8) Resumen
cat <<EOF

==> Listo.

  Postgres:  postgresql://$DB_USER:yantar_dev_password@localhost:5432/$DB_NAME
  Backend:   http://localhost:3001  (NestJS)
  Frontend:  http://localhost:3000  (Next.js)

  URLs de demo (Pizzeria Napoli):
    SaaS landing:    http://localhost:3000
    Cliente Napoli:  http://napoli.localhost:3000
    Sede Centro:     http://napoli.localhost:3000/centro
    Login admin:     http://napoli.localhost:3000/login
    Panel admin:     http://napoli.localhost:3000/admin
    Vista operativa: http://napoli.localhost:3000/operativo
    Alta empresa:    http://localhost:3000/register-business

  Admin de demo: admin@napoli.es / admin123

EOF

# 9) pnpm dev
if [ "$START_DEV" = "1" ]; then
  echo "==> Arrancando backend + frontend (turbo dev)... Ctrl+C para parar."
  cd "$APP_DIR"
  exec pnpm dev
fi
