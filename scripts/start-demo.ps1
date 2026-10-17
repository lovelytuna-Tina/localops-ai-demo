param(
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$caseStudyUrl = 'http://127.0.0.1:4173/case-study.html'
$logPath = Join-Path $projectPath 'localops-ai.log'
$errorLogPath = Join-Path $projectPath 'localops-ai-error.log'

function Test-LocalOpsPage {
  try {
    $response = Invoke-WebRequest -Uri $caseStudyUrl -UseBasicParsing -TimeoutSec 2
    return $response.StatusCode -eq 200 -and $response.Content -match 'LocalOps AI'
  }
  catch {
    return $false
  }
}

Write-Host ''
Write-Host 'LocalOps AI demo preflight' -ForegroundColor Cyan
Write-Host '--------------------------------' -ForegroundColor DarkGray

Set-Location -LiteralPath $projectPath

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host 'FAILED: Node.js was not found.' -ForegroundColor Red
  exit 1
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  Write-Host 'FAILED: npm was not found.' -ForegroundColor Red
  exit 1
}

Write-Host '[1/3] Validating demo data...'
& npm.cmd run check
if ($LASTEXITCODE -ne 0) {
  Write-Host 'FAILED: demo data validation did not pass.' -ForegroundColor Red
  exit 1
}

if (Test-LocalOpsPage) {
  Write-Host '[2/3] Local server is already running.' -ForegroundColor Green
}
else {
  $occupied = Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue
  if ($occupied) {
    Write-Host 'FAILED: port 4173 is occupied by a different application.' -ForegroundColor Red
    exit 1
  }

  Write-Host '[2/3] Starting local server...'
  $nodePath = (Get-Command node).Source
  $serverPath = Join-Path $projectPath 'server.mjs'

  # Some tool-managed Windows shells expose both Path and PATH. Windows
  # PowerShell 5.1 cannot build a child process environment until normalized.
  $normalizedPath = [Environment]::GetEnvironmentVariable('Path', 'Process')
  [Environment]::SetEnvironmentVariable('PATH', $null, 'Process')
  [Environment]::SetEnvironmentVariable('Path', $normalizedPath, 'Process')

  Start-Process `
    -FilePath $nodePath `
    -ArgumentList @($serverPath) `
    -WorkingDirectory $projectPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logPath `
    -RedirectStandardError $errorLogPath | Out-Null

  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 500
    if (Test-LocalOpsPage) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    Write-Host 'FAILED: server was not ready within 10 seconds. Check localops-ai-error.log.' -ForegroundColor Red
    exit 1
  }

  Write-Host '      Server started successfully.' -ForegroundColor Green
}

Write-Host '[3/3] Case study page is ready.' -ForegroundColor Green
Write-Host ''
Write-Host "Open: $caseStudyUrl" -ForegroundColor Cyan
Write-Host 'Fallback demo mode does not require network access or an API key.' -ForegroundColor DarkGray

if (-not $NoBrowser) {
  Start-Process $caseStudyUrl
}

exit 0
