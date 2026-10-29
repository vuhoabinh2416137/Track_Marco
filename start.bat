@echo off
title MacroTrack - Khoi Dong He Thong

echo ======================================================================
echo    MACROTRACK - KHOI DONG HE THONG CUC BO
echo ======================================================================
echo.

set ROOT_DIR=%~dp0

echo [1/4] Giai phong cong 8080 va 3000 neu dang bi chiem...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8080,3000 -ErrorAction SilentlyContinue | ForEach-Object { if ($_.OwningProcess -gt 0) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }" >nul 2>&1

echo [2/4] Dang khoi dong Backend Spring Boot 3 (Port 8080)...
if exist "%ROOT_DIR%backend\target\macrotrack-backend-1.0.0.jar" (
    start "MacroTrack-Backend" cmd /k "cd /d %ROOT_DIR%backend && title MacroTrack-Backend && java -jar target\macrotrack-backend-1.0.0.jar"
) else (
    start "MacroTrack-Backend" cmd /k "cd /d %ROOT_DIR%backend && title MacroTrack-Backend && mvn spring-boot:run"
)

echo [3/4] Dang khoi dong Frontend Next.js PWA (Port 3000)...
if not exist "%ROOT_DIR%frontend\.next\BUILD_ID" (
    echo [Info] Bien dich Frontend ban dau...
    cmd /c "cd /d %ROOT_DIR%frontend && npm run build"
)
start "MacroTrack-Frontend" cmd /k "cd /d %ROOT_DIR%frontend && title MacroTrack-Frontend && npm run start"

echo [4/4] Dang cho Backend va Frontend san sang hoat dong...
powershell -NoProfile -Command "$ready = $false; $attempts = 0; while (-not $ready -and $attempts -lt 30) { Start-Sleep -Seconds 1; $attempts++; try { $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/profile' -Method GET -TimeoutSec 2 -ErrorAction Stop; if ($res -and $res.name) { $ready = $true } } catch {} Write-Host -NoNewline '.' }; if ($ready) { Write-Host ' [OK!]' } else { Write-Host ' [TIMEOUT]' }"

echo.
echo ======================================================================
echo    [SUCCESS] He thong MacroTrack da san sang!
echo    - Frontend Web (PWA): http://localhost:3000
echo    - Backend API (REST): http://localhost:8080
echo    - Trang thai API:     ONLINE
echo.
echo    De dung toan bo he thong, hay chay file stop.bat!
echo ======================================================================
echo.

start http://localhost:3000
ping 127.0.0.1 -n 4 >nul