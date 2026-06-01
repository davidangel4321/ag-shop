@echo off
title AG Shop
echo Iniciando AG Shop...
set PATH=C:\Users\dangelgirald\AppData\Local\Programs\node;%PATH%
cd /d "%~dp0"
start "" "http://localhost:5173"
npm run dev
