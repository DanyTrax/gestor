@echo off
REM Script para Windows - Build y Push al repositorio
REM Uso: build-and-push.bat [mensaje-commit]

echo 🔨 Iniciando proceso de build y push...

REM 1. Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo Asegúrate de estar en el directorio raíz del proyecto
    exit /b 1
)

REM 2. Instalar dependencias si node_modules no existe
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ❌ Error al instalar dependencias
        exit /b 1
    )
)

REM 3. Hacer build
echo 🔨 Compilando proyecto...
call npm run build

if errorlevel 1 (
    echo ❌ Error al compilar el proyecto
    exit /b 1
)

REM 4. Verificar que dist/ se creó
if not exist "dist" (
    echo ❌ Error: No se creó el directorio dist/
    exit /b 1
)

echo ✅ Build completado exitosamente

REM 5. Agregar dist/ al staging (forzar aunque esté en .gitignore)
echo 📝 Agregando dist/ al repositorio...
git add -f dist/

REM 6. Agregar otros archivos modificados
git add .

REM 7. Crear commit
if "%1"=="" (
    set COMMIT_MSG=build: Actualizar build de producción
) else (
    set COMMIT_MSG=%1
)
echo 💾 Creando commit: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"

if errorlevel 1 (
    echo ❌ Error al crear commit
    exit /b 1
)

REM 8. Push al repositorio
echo 🚀 Subiendo cambios al repositorio...
git push origin main

if errorlevel 1 (
    echo ❌ Error al hacer push
    echo Intenta manualmente: git push origin main
    exit /b 1
)

echo ✅ ¡Proceso completado exitosamente!
echo 📦 Build subido al repositorio
echo.
echo En el servidor (cPanel), ejecuta:
echo   git pull origin main
echo   # Los archivos de dist/ estarán listos para usar

