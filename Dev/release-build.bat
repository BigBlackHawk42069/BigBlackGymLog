@echo off
REM Release build — minifies Dev\src into BigBlackGymLog.js
powershell -ExecutionPolicy Bypass -File "%~dp0..\..\..\..\Build Tools\BBGL\release-build.ps1"
if errorlevel 1 ( echo. & echo *** BUILD FAILED *** ) else ( echo. & echo Release OK. )
echo.
echo Press any key to close...
pause >nul
