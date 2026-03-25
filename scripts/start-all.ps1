# start-all.ps1
# Script PowerShell to start frontend (via start-frontend.ps1) and perform quick health checks on backend services.
# Usage: run from scripts folder: .\start-all.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# 1) Start frontend (this will open a new PowerShell window and run npm start)
if (Test-Path .\start-frontend.ps1) {
    Write-Host "Calling start-frontend.ps1 ..." -ForegroundColor Cyan
    # Start-frontend will check node/npm and try npm ci/install then open a new window running npm start
    & .\start-frontend.ps1
} else {
    Write-Host "start-frontend.ps1 not found in $scriptDir" -ForegroundColor Yellow
}

# 2) Quick health checks for backend (Eureka + Gateway)
function Wait-ForUrl {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 30
    )
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
        try {
            $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
            if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
                return $true
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    return $false
}

$eureka = 'http://localhost:8761'
$gateway = 'http://localhost:8080'

Write-Host "Waiting for Eureka ($eureka) ..." -ForegroundColor Cyan
if (Wait-ForUrl -Url $eureka -TimeoutSeconds 20) {
    Write-Host "Eureka reachable." -ForegroundColor Green
    Start-Process $eureka
} else {
    Write-Host "Eureka not reachable within timeout. Check that eureka-server is running." -ForegroundColor Yellow
}

Write-Host "Waiting for API Gateway ($gateway) ..." -ForegroundColor Cyan
if (Wait-ForUrl -Url $gateway -TimeoutSeconds 20) {
    Write-Host "Gateway reachable." -ForegroundColor Green
    Start-Process $gateway
} else {
    Write-Host "Gateway not reachable within timeout. Check that api-gateway is running and registered in Eureka." -ForegroundColor Yellow
}

Write-Host "If frontend build is running, wait for the new PowerShell window to show 'Compiled successfully'." -ForegroundColor Cyan
Write-Host "Done. If you want, run the smoke tests (create product, trigger batch) manually or ask me to generate a Postman collection." -ForegroundColor Green
