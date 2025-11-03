#!/bin/bash

# Script para instalar Laravel localmente en new/
# Ejecutar desde el directorio raíz del proyecto

echo "🚀 Instalando Laravel localmente..."
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -d "new" ]; then
    echo "❌ Error: No se encuentra el directorio 'new/'"
    echo "   Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar si Composer está instalado
if ! command -v composer &> /dev/null; then
    echo "❌ Composer no está instalado"
    echo "   Instala Composer desde: https://getcomposer.org/"
    exit 1
fi

echo "📦 Limpiando directorio new/..."
cd new

# Mover archivos existentes a temporal si existen
if [ -d "app" ] || [ -d "database" ] || [ -d "routes" ]; then
    echo "⚠️  Hay archivos en new/, moviendo a temporal..."
    mkdir -p ../temp-our-files
    [ -d "app" ] && mv app ../temp-our-files/
    [ -d "database" ] && mv database ../temp-our-files/
    [ -d "routes" ] && mv routes ../temp-our-files/
    [ -d "bootstrap" ] && mv bootstrap ../temp-our-files/
    [ -f "composer.json" ] && mv composer.json ../temp-our-files/composer-our.json
fi

echo "📦 Instalando Laravel..."
composer create-project laravel/laravel . --prefer-dist

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar Laravel"
    exit 1
fi

echo ""
echo "✅ Laravel instalado"
echo ""

# Copiar nuestros archivos de vuelta si existen
if [ -d "../temp-our-files" ]; then
    echo "📋 Copiando nuestros archivos creados..."
    
    # Copiar app/
    if [ -d "../temp-our-files/app" ]; then
        echo "   - Copiando app/"
        cp -r ../temp-our-files/app/* app/
    fi
    
    # Copiar migraciones
    if [ -d "../temp-our-files/database/migrations" ]; then
        echo "   - Copiando migraciones"
        cp -r ../temp-our-files/database/migrations/* database/migrations/
    fi
    
    # Copiar rutas
    if [ -d "../temp-our-files/routes" ]; then
        echo "   - Copiando rutas"
        cp -r ../temp-our-files/routes/* routes/
    fi
    
    # Copiar bootstrap/app.php si existe
    if [ -f "../temp-our-files/bootstrap/app.php" ]; then
        echo "   - Copiando bootstrap/app.php"
        cp ../temp-our-files/bootstrap/app.php bootstrap/app.php
    fi
    
    # Limpiar temporal
    rm -rf ../temp-our-files
    echo "✅ Archivos copiados"
fi

echo ""
echo "📦 Instalando dependencias adicionales..."
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image

echo ""
echo "✅ Dependencias instaladas"
echo ""

# Crear .env.example si no existe
if [ ! -f ".env.example" ]; then
    echo "📝 Creando .env.example..."
    cp .env .env.example
fi

# Configurar .env para desarrollo local
echo "📝 Configurando .env para desarrollo local..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
fi

echo ""
echo "🎉 ¡Laravel instalado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar .env con tu base de datos local"
echo "2. Ejecutar: php artisan migrate"
echo "3. Crear usuario inicial con: php artisan tinker"
echo "4. Iniciar servidor: php artisan serve"
echo "5. Hacer commit y push"
echo ""

