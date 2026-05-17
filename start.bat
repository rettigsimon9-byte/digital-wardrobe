@echo off
cd /d "C:\Users\retti\Desktop\Claude Code\digital-wardrobe"

echo.
echo Ermittle lokale IP-Adresse...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4-Adresse"') do (
    set IP=%%i
    goto :found
)
:found
set IP=%IP:~1%

echo.
echo ====================================
echo   Mein Kleiderschrank startet...
echo ====================================
echo   Lokal:   http://localhost:3000
echo   Handy:   http://%IP%:3000
echo ====================================
echo.

start "" "http://localhost:3000"
npx next dev --hostname 0.0.0.0
