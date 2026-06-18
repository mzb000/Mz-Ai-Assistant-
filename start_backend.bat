@echo off
set PYTHONPATH=E:\AI Assistant\zabi-assistant\backend
cd /d E:\AI Assistant\zabi-assistant\backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
