@echo off
title MacroTrack - Dung He Thong

echo ======================================================================
echo    MACROTRACK - DUNG TOAN BO TIEN TRINH CUC BO
echo ======================================================================
echo.

echo [1/3] Dang giai phong cong 8080 (Spring Boot)...
powershell -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue; if ($conns) { $conns | ForEach-Object { $p = $_.OwningProcess; if ($p -gt 0) { Write-Host '  -> Dung tien trinh PID:' $p; Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } } } else { Write-Host '  -> Cong 8080 dang trong.' }"

echo [2/3] Dang giai phong cong 3000 (Next.js Frontend)...
powershell -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($conns) { $conns | ForEach-Object { $p = $_.OwningProcess; if ($p -gt 0) { Write-Host '  -> Dung tien trinh PID:' $p; Stop-Process -Id $p -Force -ErrorAction SilentlyContinue } } } else { Write-Host '  -> Cong 3000 dang trong.' }"

echo [3/3] Dong cac cua so terminal MacroTrack...
taskkill /F /FI "WINDOWTITLE eq MacroTrack-Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq MacroTrack-Frontend*" >nul 2>&1

echo.
echo ======================================================================
echo    [SUCCESS] Da dung toan bo tien trinh va giai phong cong thanh cong!
echo    - Cong 8080: San sang
echo    - Cong 3000: San sang
echo ======================================================================
echo.
pause