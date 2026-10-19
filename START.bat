@echo off
title ExpertLens
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install it from https://nodejs.org first.
  pause
  exit /b 1
)

if not exist node_modules (
  echo [ExpertLens] First run - installing dependencies, this may take a few minutes...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
)

echo [ExpertLens] Starting dev server...
echo [ExpertLens] Browser will open at http://localhost:5173 automatically.
echo [ExpertLens] Keep this window open while using the app. Press Ctrl+C to stop.
call npx vite --open
pause
