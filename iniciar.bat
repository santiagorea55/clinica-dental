@echo off
chcp 65001 >nul
title Clinica Dra. Janet - servidor local
cd /d "%~dp0"
set PY=
python --version >nul 2>&1 && set PY=python
if not defined PY py --version >nul 2>&1 && set PY=py
if not defined PY (
  echo No se encontro Python. Instalelo desde https://www.python.org/downloads/ y marque "Add Python to PATH".
  pause
  exit /b 1
)
%PY% iniciar.py %*
echo.
echo El servidor se detuvo. Si vio un error arriba, copielo y mandelo.
pause
