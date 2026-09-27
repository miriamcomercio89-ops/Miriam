@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Periodica
echo.
echo   Periodica — se abre en el navegador, con formato.
echo   No abras index.html. No cierres esta ventana negra.
echo.

where powershell >nul 2>&1
if not errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0jugar-servidor.ps1"
  goto :fin
)

where py >nul 2>&1
if not errorlevel 1 (
  py "%~dp0jugar-servidor.py"
  goto :fin
)

where python >nul 2>&1
if not errorlevel 1 (
  python "%~dp0jugar-servidor.py"
  goto :fin
)

where node >nul 2>&1
if not errorlevel 1 (
  if not exist "node_modules\" (
    echo  Primera vez: instalando. Espera un minuto...
    call npm install
  )
  echo  Abriendo http://localhost:5173
  call npm start
  goto :fin
)

echo  No se pudo abrir el juego automaticamente.
echo  Instala Node.js LTS en https://nodejs.org y vuelve a pulsar JUGAR.bat
start https://nodejs.org
pause

:fin
pause
