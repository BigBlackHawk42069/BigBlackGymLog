@echo off
REM ==========================================================
REM  Double-click to rebuild the Root deployable from
REM  Beautified\src. Keep this file in the Root folder.
REM ==========================================================

cd /d "%~dp0BuildTools"

echo Building Root deployable from Beautified\src ...
echo.

node build-root.js
if errorlevel 1 goto failed

echo.
node --check "..\Big-Black-Gym-Log-Test.js"
if errorlevel 1 goto failed

echo.
echo Build OK. Output: Root\Big-Black-Gym-Log-Test.js
goto done

:failed
echo.
echo *** BUILD FAILED -- see the message above. ***

:done
echo.
pause
