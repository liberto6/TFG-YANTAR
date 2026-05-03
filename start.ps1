# Yantar - arranque local end-to-end (PowerShell).
# Levanta Postgres en Docker, aplica migraciones Prisma, ejecuta el seed,
# genera el cliente Prisma y arranca backend + frontend con turbo dev.
#
# Uso (desde la raiz del monorepo):
#   .\start.ps1            arranque completo
#   .\start.ps1 -Reset     borra y recrea el schema (vuelve a sembrar)
#   .\start.ps1 -NoDev     prepara todo pero no lanza pnpm dev

param(
  [switch]$Reset,
  [switch]$NoDev
)

# PowerShell 5.1 convierte stderr de comandos nativos en NativeCommandError
# cuando ErrorActionPreference=Stop, incluso si el comando salio con codigo 0
# (docker compose escribe progreso a stderr). Usamos Continue y comprobamos
# $LASTEXITCODE manualmente despues de cada llamada nativa.
$ErrorActionPreference = 'Continue'

$AppDir    = Split-Path -Parent $MyInvocation.MyCommand.Path
$Container = 'yantar-postgres'
$DbName    = 'yantar_dev'
$DbUser    = 'yantar'

Write-Host '==> Yantar dev bootstrap'

# 1) Dependencias
#
# Workaround Windows: si el usuario no tiene "Modo de desarrollador" activado,
# Windows bloquea junctions con "untrusted mount point" y pnpm no puede crear
# node_modules normalmente. Instalamos en modo plano (shamefully-hoist + copy)
# y quitamos temporalmente @yantar/shared del workspace, luego copiamos
# packages/shared como directorio real dentro de cada app.
$canSymlink = ((whoami /priv 2>$null) -match 'SeCreateSymbolicLink')
# Con shamefully-hoist las deps externas viven en la raiz; @yantar/shared lo
# inyectamos como copia dentro de cada app. Comprobamos ambos.
$haveRootDeps = Test-Path (Join-Path $AppDir 'node_modules\@nestjs\core\package.json')
$haveSharedInBackend = Test-Path (Join-Path $AppDir 'apps\backend\node_modules\@yantar\shared\dist\index.js')
$haveSharedInWeb = Test-Path (Join-Path $AppDir 'apps\web\node_modules\@yantar\shared\dist\index.js')
$depsOk = $haveRootDeps -and $haveSharedInBackend -and $haveSharedInWeb

if (-not $depsOk) {
  Write-Host '==> Instalando dependencias...'

  $bp = Join-Path $AppDir 'apps\backend\package.json'
  $wp = Join-Path $AppDir 'apps\web\package.json'

  if (-not $canSymlink) {
    Write-Host '    (modo Windows sin SeCreateSymbolicLink: instalacion plana + copia de @yantar/shared)'

    # 1a) Backup y quitar @yantar/shared de las apps
    Copy-Item $bp "$bp.bak" -Force
    Copy-Item $wp "$wp.bak" -Force
    foreach ($p in @($bp,$wp)) {
      $j = Get-Content $p -Raw | ConvertFrom-Json
      if ($j.dependencies.PSObject.Properties.Match('@yantar/shared').Count -gt 0) {
        $j.dependencies.PSObject.Properties.Remove('@yantar/shared')
      }
      $j | ConvertTo-Json -Depth 10 | Set-Content $p -Encoding utf8
    }

    # 1b) Limpiar node_modules para forzar layout plano
    foreach ($d in @('node_modules','apps\backend\node_modules','apps\web\node_modules','packages\shared\node_modules')) {
      Remove-Item -Recurse -Force (Join-Path $AppDir $d) -ErrorAction SilentlyContinue
    }

    # 1c) Instalar plano + copia
    $env:npm_config_node_linker = 'hoisted'
    $env:npm_config_shamefully_hoist = 'true'
    $env:npm_config_package_import_method = 'copy'
    Push-Location $AppDir
    try {
      pnpm install --no-frozen-lockfile --child-concurrency=1
      if ($LASTEXITCODE -ne 0) { throw 'pnpm install fallo' }
    } finally { Pop-Location }

    # 1d) Restaurar package.json
    Move-Item "$bp.bak" $bp -Force
    Move-Item "$wp.bak" $wp -Force

    # 1e) Inyectar @yantar/shared como directorio real (no junction)
    $srcShared = Join-Path $AppDir 'packages\shared'
    foreach ($app in @('apps\backend','apps\web')) {
      $dest = Join-Path $AppDir "$app\node_modules\@yantar\shared"
      $destParent = Split-Path $dest -Parent
      if (-not (Test-Path $destParent)) { New-Item -ItemType Directory -Path $destParent -Force | Out-Null }
      if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
      New-Item -ItemType Directory -Path $dest -Force | Out-Null
      Copy-Item (Join-Path $srcShared 'package.json') $dest
      Copy-Item (Join-Path $srcShared 'dist') $dest -Recurse
    }
    Write-Host '    @yantar/shared inyectado en apps/backend y apps/web.'
  } else {
    # Camino normal con symlinks (Developer Mode o admin)
    Push-Location $AppDir
    try { pnpm install } finally { Pop-Location }
  }
} else {
  Write-Host '==> node_modules detectado con @yantar/shared, salto pnpm install'
}

# 2) Postgres en Docker
Write-Host '==> Levantando Postgres (docker compose up -d)...'
Push-Location $AppDir
try {
  docker compose up -d 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'docker compose up fallo' }
} finally { Pop-Location }

# 3) Esperar healthcheck
Write-Host '==> Esperando a que Postgres este listo...'
$ready = $false
for ($i = 1; $i -le 60; $i++) {
  docker exec $Container pg_isready -U $DbUser -d $DbName *> $null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Seconds 1
}
if (-not $ready) { throw 'Timeout esperando Postgres' }
Write-Host '    Postgres listo.'

# 4) Reset opcional: borra el schema entero para resembrar
if ($Reset) {
  Write-Host '==> -Reset: borrando schema public...'
  docker exec $Container psql -U $DbUser -d $DbName -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $DbUser;" *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Fallo el DROP SCHEMA' }
}

# 5) Aplicar migraciones (idempotente)
Write-Host '==> Aplicando migraciones Prisma...'
Push-Location (Join-Path $AppDir 'apps\backend')
try {
  pnpm exec prisma migrate deploy
  if ($LASTEXITCODE -ne 0) { throw 'prisma migrate deploy fallo' }
} finally { Pop-Location }

# 6) Generar Prisma Client
Write-Host '==> Generando Prisma Client...'
Push-Location (Join-Path $AppDir 'apps\backend')
try {
  pnpm exec prisma generate *> $null
  if ($LASTEXITCODE -ne 0) { throw 'prisma generate fallo' }
} finally { Pop-Location }

# 7) Seed (idempotente: usa upsert, asi que es seguro reejecutarlo)
$dataCountRaw = docker exec $Container psql -U $DbUser -d $DbName -tAc "SELECT count(*) FROM companies;" 2>$null
$dataCount = 0
[int]::TryParse(($dataCountRaw -replace '\s',''), [ref]$dataCount) | Out-Null
if ($Reset -or $dataCount -eq 0) {
  Write-Host '==> Sembrando datos de demo (Pizzeria Napoli)...'
  Push-Location (Join-Path $AppDir 'apps\backend')
  try {
    pnpm exec prisma db seed
    if ($LASTEXITCODE -ne 0) { throw 'prisma db seed fallo' }
  } finally { Pop-Location }
} else {
  Write-Host "==> Ya hay datos en la DB ($dataCount empresas). Salto seed. Usa -Reset para resembrar."
}

# 8) Resumen
Write-Host ''
Write-Host '==> Listo.'
Write-Host ''
Write-Host "  Postgres:   postgresql://${DbUser}:yantar_dev_password@localhost:5432/$DbName"
Write-Host '  Backend:    http://localhost:3001  (NestJS)'
Write-Host '  Frontend:   http://localhost:3000  (Next.js)'
Write-Host ''
Write-Host '  URLs de demo (Pizzeria Napoli):'
Write-Host '    SaaS landing:    http://localhost:3000'
Write-Host '    Cliente Napoli:  http://napoli.localhost:3000'
Write-Host '    Sede Centro:     http://napoli.localhost:3000/centro'
Write-Host '    Login admin:     http://napoli.localhost:3000/login'
Write-Host '    Panel admin:     http://napoli.localhost:3000/admin'
Write-Host '    Vista operativa: http://napoli.localhost:3000/operativo'
Write-Host '    Alta empresa:    http://localhost:3000/register-business'
Write-Host ''
Write-Host '  Admin de demo: admin@napoli.es / admin123'
Write-Host ''

# 9) pnpm dev
if (-not $NoDev) {
  Write-Host '==> Arrancando backend + frontend (turbo dev)... Ctrl+C para parar.'
  Push-Location $AppDir
  pnpm dev
  Pop-Location
}
