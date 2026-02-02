@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PS_EXE=powershell"

where pwsh >nul 2>&1
if %errorlevel%==0 set "PS_EXE=pwsh"

"%PS_EXE%" -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%ship.ps1" %*
exit /b %errorlevel%
