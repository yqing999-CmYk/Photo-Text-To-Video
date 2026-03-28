@echo off
echo Starting Photo-To-Video server...

:: Clear bad Python environment variables
set PYTHONHOME=
set PYTHONPATH=

:: Change to the project directory
cd /d "%~dp0"

:: Start the server
"C:\Users\yqing\AppData\Local\Programs\Python\Python311\python.exe" -m uvicorn backend.main:app --reload --port 8000

pause
