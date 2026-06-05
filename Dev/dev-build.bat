@echo off
REM Dev build — concatenates Dev\src into BBGLDev.js (expanded/readable)
powershell -ExecutionPolicy Bypass -File "%~dp0..\..\..\..\Build Tools\BBGL\dev-build.ps1"
if errorlevel 1 ( echo. & echo *** BUILD FAILED *** ) else ( echo. & echo Build OK. )
echo.
pause
