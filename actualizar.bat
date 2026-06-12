@echo off
title Sincronizador de Capturas de la Meta (PowerShell)
echo ==============================================
echo   Sincronizando Escuadrón de Apoyo...
echo ==============================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0actualizar.ps1"
echo ==============================================
echo   ¡Sincronización completada con éxito!
echo ==============================================
pause
