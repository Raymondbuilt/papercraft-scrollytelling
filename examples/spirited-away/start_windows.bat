@echo off
echo Starting Papercraft Scrollytelling v2.8 Local Server...
start "" "http://localhost:8080/examples/spirited-away/"
cd /d "%~dp0\..\.."
python -m http.server 8080
