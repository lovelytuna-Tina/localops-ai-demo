@echo off
chcp 65001 >nul
title LocalOps AI Demo
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-demo.ps1"
if errorlevel 1 (
  echo.
  echo Startup failed. Keep this window open and check localops-ai-error.log.
  pause
)
