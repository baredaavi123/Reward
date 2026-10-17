@echo off
setlocal
title Universal APK Builder - vyomweb
color 0b

echo.
echo ============================================================
echo       VYOMWEB UNIVERSAL APK BUILDER
echo ============================================================
echo.
echo Project Folder: %~dp0
echo Output Folder : %~dp0build\
echo.

node "F:\kaam\Project\APK\cli-build.js" "%~dp0"

if %ERRORLEVEL% EQU 0 (
    color 0a
    echo.
    echo ============================================================
    echo   [SUCCESS] APK created in "%~dp0build\"!
    echo ============================================================
) else (
    color 0c
    echo.
    echo ============================================================
    echo   [ERROR] APK build encountered an issue.
    echo ============================================================
)

echo.
pause
