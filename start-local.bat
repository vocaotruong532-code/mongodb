@echo off
cd /d "%~dp0"
where python >nul 2>nul
if not errorlevel 1 (
    python -m http.server 8000
) else (
    py -m http.server 8000
)
