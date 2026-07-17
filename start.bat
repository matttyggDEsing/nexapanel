@echo off
title NexaPanel
echo === Iniciando NexaPanel ===
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login:    admin@nexapanel.io / Admin123!
echo.
echo Cerra ambas ventanas para detener
echo.

start "NexaPanel Backend" cmd /c "cd /d %~dp0backend && npm run dev"
start "NexaPanel Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"
echo Hecho.
pause
