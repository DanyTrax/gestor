#!/bin/bash

# Script completo para instalar Laravel localmente con todas las configuraciones
# Ejecutar desde la raíz del proyecto

echo "🚀 Instalando Laravel completo localmente..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "new" ]; then
    echo "❌ Error: No se encuentra el directorio 'new/'"
    echo "   Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar Composer
if ! command -v composer &> /dev/null; then
    echo "❌ Composer no está instalado"
    echo "   Instala Composer desde: https://getcomposer.org/"
    exit 1
fi

echo "📦 Paso 1: Preparando directorio new/..."
cd new

# Mover archivos existentes a temporal si existen
if [ -d "app" ] || [ -d "database" ] || [ -d "routes" ]; then
    echo "   Moviendo archivos existentes a temporal..."
    mkdir -p ../temp-our-files
    [ -d "app" ] && mv app ../temp-our-files/
    [ -d "database" ] && mv database ../temp-our-files/
    [ -d "routes" ] && mv routes ../temp-our-files/
    [ -d "bootstrap" ] && mv bootstrap ../temp-our-files/
    [ -f "composer.json" ] && mv composer.json ../temp-our-files/composer-our.json
fi

echo "📦 Paso 2: Instalando Laravel..."
composer create-project laravel/laravel . --prefer-dist

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar Laravel"
    exit 1
fi

echo ""
echo "✅ Laravel instalado"
echo ""

# Copiar nuestros archivos de vuelta
if [ -d "../temp-our-files" ]; then
    echo "📋 Paso 3: Copiando nuestros archivos creados..."
    
    if [ -d "../temp-our-files/app" ]; then
        echo "   - Copiando app/"
        cp -r ../temp-our-files/app/* app/
    fi
    
    if [ -d "../temp-our-files/database/migrations" ]; then
        echo "   - Copiando migraciones"
        mkdir -p database/migrations
        cp -r ../temp-our-files/database/migrations/* database/migrations/
    fi
    
    if [ -d "../temp-our-files/routes" ]; then
        echo "   - Copiando rutas"
        cp -r ../temp-our-files/routes/* routes/
    fi
    
    if [ -f "../temp-our-files/bootstrap/app.php" ]; then
        echo "   - Copiando bootstrap/app.php"
        cp ../temp-our-files/bootstrap/app.php bootstrap/app.php
    fi
    
    rm -rf ../temp-our-files
    echo "✅ Archivos copiados"
fi

echo ""
echo "📦 Paso 4: Instalando dependencias adicionales..."
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image

echo ""
echo "✅ Dependencias instaladas"
echo ""

echo "📝 Paso 5: Configurando .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
    echo "✅ .env creado y clave generada"
else
    echo "⚠️  .env ya existe, usando el existente"
fi

echo ""
echo "📝 Paso 6: Configurando .env.example para producción..."
cat > .env.example << 'EOF'
APP_NAME="Gestor de Cobros"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://clients.dowgroupcol.com/new

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=mail.dvsystemsas.com
MAIL_PORT=465
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"
EOF

echo "✅ .env.example configurado para producción"
echo ""

echo "📁 Paso 7: Creando directorios necesarios..."
mkdir -p storage/app/public/invoices
mkdir -p storage/app/public/uploads/payments
mkdir -p storage/app/public/uploads/tickets
mkdir -p bootstrap/cache

echo "✅ Directorios creados"
echo ""

echo "🔗 Paso 8: Creando enlace simbólico de storage..."
php artisan storage:link

echo ""
echo "📝 Paso 9: Actualizando .gitignore..."
cat >> .gitignore << 'EOF'

# Archivos de desarrollo local
/.idea
/.vscode
*.log
.DS_Store

# Pero mantener vendor/ para facilitar despliegue
# (comentar si prefieres no subir vendor/)
# /vendor
EOF

echo "✅ .gitignore actualizado"
echo ""

echo "🎉 ¡Laravel instalado y configurado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar .env con tu base de datos local"
echo "2. Ejecutar: php artisan migrate"
echo "3. Crear usuario inicial con: php artisan tinker"
echo "4. Probar localmente: php artisan serve"
echo "5. Hacer commit y push"
echo "6. En servidor: git pull y ejecutar migraciones"
echo ""

