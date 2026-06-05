@echo off
REM ==========================================================
REM  Double-click to concatenate Beautified\src into the
REM  readable dev build (Big-Black-Gym-Log-Test.beautified.js)
REM ==========================================================

powershell -ExecutionPolicy Bypass -File "%~dp0concat.ps1"

if errorlevel 1 goto failed

echo.
echo Build OK. Output: Beautified\Big-Black-Gym-Log-Test.beautified.js
goto done

:failed
echo.
echo *** BUILD FAILED -- see the message above. ***

:done
echo.
pause
