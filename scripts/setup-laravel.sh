#!/bin/bash

# Script para crear estructura de migración a Laravel
# Ejecutar desde el directorio raíz del proyecto

echo "🚀 Creando estructura de migración a Laravel..."
echo ""

# Crear directorios
echo "📁 Creando directorios..."
mkdir -p gestor-cobros-new
mkdir -p scripts
mkdir -p shared/uploads/payments
mkdir -p shared/uploads/tickets
mkdir -p shared/invoices

echo "✅ Directorios creados"
echo ""

# Verificar si Composer está instalado
if ! command -v composer &> /dev/null; then
    echo "⚠️  Composer no está instalado"
    echo "📥 Instalando Composer..."
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
fi

# Instalar Laravel
echo "📦 Instalando Laravel..."
cd gestor-cobros-new
composer create-project laravel/laravel . --prefer-dist

echo ""
echo "✅ Laravel instalado"
echo ""

# Instalar paquetes adicionales
echo "📦 Instalando paquetes adicionales..."
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
composer require kreait/firebase-php

echo ""
echo "✅ Paquetes instalados"
echo ""

# Volver al directorio raíz
cd ..

echo "🎉 Estructura base creada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar .env en gestor-cobros-new/"
echo "2. Ejecutar migraciones"
echo "3. Crear modelos y controladores"

