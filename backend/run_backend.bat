@echo off
REM Start the VirtuHire Backend Server
REM This script starts the FastAPI backend using the virtual environment

cd /d "%~dp0"

echo Starting VirtuHire Backend...
echo.

REM Use the venv Python executable to run uvicorn
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000

pause
