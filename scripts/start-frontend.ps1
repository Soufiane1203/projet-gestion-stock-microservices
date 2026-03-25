# start-frontend.ps1
# Script PowerShell to install and start the Angular frontend.
# Usage: Run this in PowerShell (Administrator if installing node/npm) on your machine:
#   .\start-frontend.ps1

Param()

$frontendPath = Join-Path $PSScriptRoot "..\frontend"
Write-Host "Frontend path: $frontendPath"

# Check node
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) {
    Write-Host "Node or npm not found in PATH." -ForegroundColor Yellow
    Write-Host "Please install Node.js (LTS >= 16) from https://nodejs.org/ and re-run this script." -ForegroundColor Cyan
    exit 1
}

# Move to frontend
Set-Location $frontendPath

Write-Host "Installing npm dependencies (npm ci) ..." -ForegroundColor Cyan
try {
    npm ci
    $code = $LASTEXITCODE
} catch {
    $code = $LASTEXITCODE
}
if ($code -ne 0) {
    Write-Host "npm ci failed (likely missing package-lock.json). Falling back to 'npm install'..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed. Check the output above." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Write-Host "Starting Angular dev server (npm start / ng serve) ..." -ForegroundColor Cyan
# Start ng serve in a new PowerShell window so it keeps running
$pw = "$PSHOME\powershell.exe"
$script = "cd `"$frontendPath`" ; npm start"
Start-Process -FilePath $pw -ArgumentList "-NoExit","-Command",$script -WorkingDirectory $frontendPath

Write-Host "Angular dev server started in a new PowerShell window. Open http://localhost:4200 after the build finishes." -ForegroundColor Green

# Optional: check port 4200
Start-Sleep -Seconds 2
$listener = netstat -a -n -o | Select-String ":4200"
if ($listener) {
    Write-Host "Port 4200 status (netstat excerpt):" -ForegroundColor Cyan
    $listener | Select-Object -First 10 | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "No netstat entry for port 4200 yet. Wait a few seconds and refresh." -ForegroundColor Yellow
}
