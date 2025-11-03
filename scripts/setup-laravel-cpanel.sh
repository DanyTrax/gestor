#!/bin/bash

# Script para configurar Laravel en cPanel
# Uso: ./setup-laravel-cpanel.sh

set -e

echo "🚀 Configurando Laravel en cPanel..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: No se encontró artisan. Asegúrate de estar en el directorio de Laravel (new/)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Directorio de Laravel detectado${NC}"
echo ""

# 1. Instalar dependencias
echo "📦 Paso 1: Instalando dependencias..."
composer install --no-dev --optimize-autoloader
echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# 2. Verificar .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env no existe. Copiando desde .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env con tus datos de base de datos${NC}"
    echo ""
fi

# 3. Generar APP_KEY
if ! grep -q "APP_KEY=base64:" .env; then
    echo "🔑 Generando APP_KEY..."
    php artisan key:generate
    echo -e "${GREEN}✅ APP_KEY generado${NC}"
else
    echo -e "${GREEN}✅ APP_KEY ya existe${NC}"
fi
echo ""

# 4. Crear directorios necesarios
echo "📁 Creando directorios..."
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/framework/cache
mkdir -p storage/logs
mkdir -p storage/app/public
mkdir -p bootstrap/cache
echo -e "${GREEN}✅ Directorios creados${NC}"
echo ""

# 5. Configurar permisos
echo "🔐 Configurando permisos..."
chmod -R 775 storage bootstrap/cache
chmod -R 755 public
echo -e "${GREEN}✅ Permisos configurados${NC}"
echo ""

# 6. Ejecutar migraciones
echo "🗄️  Ejecutando migraciones..."
read -p "¿Ejecutar migraciones ahora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    php artisan migrate --force
    echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"
else
    echo -e "${YELLOW}⚠️  Migraciones omitidas. Ejecuta: php artisan migrate --force${NC}"
fi
echo ""

# 7. Crear tabla de sesiones
echo "📋 Creando tabla de sesiones..."
read -p "¿Crear tabla de sesiones? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    php artisan session:table 2>/dev/null || echo "Migración de sesiones ya existe"
    php artisan migrate --force
    echo -e "${GREEN}✅ Tabla de sesiones creada${NC}"
else
    echo -e "${YELLOW}⚠️  Tabla de sesiones omitida. Ejecuta: php artisan session:table && php artisan migrate${NC}"
fi
echo ""

# 8. Optimizar para producción
echo "⚡ Optimizando para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo -e "${GREEN}✅ Cache optimizado${NC}"
echo ""

# 9. Resumen
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita .env con tus datos de base de datos"
echo "2. Verifica que APP_DEBUG=false"
echo "3. Crea un usuario inicial: php artisan tinker"
echo "4. Prueba el login en tu navegador"
echo ""

