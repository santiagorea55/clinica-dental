@echo off
setlocal
cd /d "%~dp0" || (echo ERROR: No se pudo abrir la carpeta del BAT.& pause & exit /b 1)
set "ROOT=%CD%"
echo =============================================
echo  EXTRACTOR DE CONTENIDO - DOMINIOS E INTENCIONES
echo =============================================
echo Raiz del proyecto: %ROOT%
if not exist "%ROOT%\src\" (
  echo ERROR: No existe la carpeta src en esta ubicacion.
  pause
  exit /b 1
)
if not exist "%ROOT%\extraer_dataset.py" (
  echo ERROR: Falta extraer_dataset.py junto al BAT.
  pause
  exit /b 1
)
where py >nul 2>&1
if not errorlevel 1 (
  py -3 "%ROOT%\extraer_dataset.py" --root "%ROOT%"
) else (
  where python >nul 2>&1
  if errorlevel 1 (
    echo ERROR: Se requiere Python 3 instalado.
    pause
    exit /b 1
  )
  python "%ROOT%\extraer_dataset.py" --root "%ROOT%"
)
if errorlevel 1 (
  echo ERROR: No se completo la extraccion.
  pause
  exit /b 1
)
echo.
echo Archivos generados en: "%ROOT%\salida_dataset"
pause
