$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$standalone = Join-Path $root ".next\standalone"
$standaloneServer = Join-Path $standalone "server.js"
$outDir = Join-Path $root "src-tauri\server_bundle"
$tempDir = Join-Path $root "src-tauri\.server_bundle_tmp"
$tauriDist = Join-Path $root ".tauri-dist"

if (-not (Test-Path $standaloneServer)) {
  throw "Run npm run build first (.next\standalone\server.js missing)."
}

if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

robocopy $standalone $tempDir /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Failed copying standalone output." }

$nextStatic = Join-Path $root ".next\static"
$tempStatic = Join-Path $tempDir ".next\static"
New-Item -ItemType Directory -Path (Split-Path $tempStatic -Parent) -Force | Out-Null
robocopy $nextStatic $tempStatic /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Failed copying .next\static." }

$publicDir = Join-Path $root "public"
$tempPublic = Join-Path $tempDir "public"
robocopy $publicDir $tempPublic /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Failed copying public." }

$prismaDir = Join-Path $root "prisma"
$tempPrisma = Join-Path $tempDir "prisma"
robocopy $prismaDir $tempPrisma /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "Failed copying prisma." }

# Do not ship .env in desktop bundle.
# Prisma/Next runtime env is injected by the Tauri launcher (absolute DATABASE_URL + JWT_SECRET).
$dotEnv = Join-Path $tempDir ".env"
if (Test-Path $dotEnv) { Remove-Item $dotEnv -Force }

$devDb = Join-Path $root "prisma\dev.db"
if (Test-Path $devDb) {
  Copy-Item $devDb (Join-Path $tempDir "prisma\dev.db") -Force
}

if (Test-Path $outDir) { Remove-Item $outDir -Recurse -Force }
Move-Item -Path $tempDir -Destination $outDir

New-Item -ItemType Directory -Path $tauriDist -Force | Out-Null
Set-Content -Path (Join-Path $tauriDist "index.html") -Value "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'/><title>Komodo Hub</title></head><body><p>Desktop shell loads the local Next server.</p></body></html>" -Encoding UTF8

Write-Host "Wrote src-tauri/server_bundle and .tauri-dist/index.html"
