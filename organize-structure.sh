#!/bin/bash

# Script para organizar la estructura del proyecto
# Separa sistema actual (React) y sistema nuevo (Laravel)

echo "📁 Organizando estructura del proyecto..."
echo ""

# Crear directorios si no existen
mkdir -p current new shared/uploads/payments shared/uploads/tickets shared/invoices scripts docs

echo "✅ Directorios creados"
echo ""

# Mover archivos del sistema actual (React) a current/
echo "📦 Moviendo archivos del sistema actual a current/..."

# Archivos React
mv src current/ 2>/dev/null || true
mv dist current/ 2>/dev/null || true
mv package.json current/ 2>/dev/null || true
mv package-lock.json current/ 2>/dev/null || true
mv node_modules current/ 2>/dev/null || true
mv vite.config.js current/ 2>/dev/null || true
mv tailwind.config.js current/ 2>/dev/null || true
mv postcss.config.js current/ 2>/dev/null || true
mv index.html current/ 2>/dev/null || true
mv .eslintrc.cjs current/ 2>/dev/null || true

# Archivos PHP del sistema actual
mv send-email.php current/ 2>/dev/null || true
mv upload.php current/ 2>/dev/null || true
mv uploads current/ 2>/dev/null || true

# Firebase
mv firebase.json current/ 2>/dev/null || true
mv firebase-rules.txt current/ 2>/dev/null || true
mv firebase-rules-simple.txt current/ 2>/dev/null || true
mv functions current/ 2>/dev/null || true

# Docker del sistema actual
mv Dockerfile current/ 2>/dev/null || true
mv docker-compose.yml current/ 2>/dev/null || true
mv docker-compose-git.yml current/ 2>/dev/null || true
mv .dockerignore current/ 2>/dev/null || true

# .htaccess del sistema actual
mv .htaccess current/ 2>/dev/null || true

echo "✅ Archivos del sistema actual movidos"
echo ""

# Mover archivos de Laravel a new/
echo "📦 Moviendo archivos de Laravel a new/..."

# Estructura Laravel
mv app new/ 2>/dev/null || true
mv database new/ 2>/dev/null || true
mv routes new/ 2>/dev/null || true
mv bootstrap new/ 2>/dev/null || true
mv composer.json new/ 2>/dev/null || true

# Scripts de Laravel
mv setup-laravel.sh scripts/ 2>/dev/null || true
mv scripts/migrate-firebase-to-sql.php scripts/ 2>/dev/null || true

echo "✅ Archivos de Laravel movidos"
echo ""

# Mover documentación a docs/
echo "📚 Moviendo documentación a docs/..."

mv MIGRACION-LARAVEL-COMPLETA.md docs/ 2>/dev/null || true
mv ESTRATEGIA-MIGRACION-DATOS.md docs/ 2>/dev/null || true
mv LARAVEL-API-ARCHITECTURE.md docs/ 2>/dev/null || true
mv MIGRACION-PASOS.md docs/ 2>/dev/null || true
mv README-LARAVEL.md docs/ 2>/dev/null || true
mv ESTRUCTURA-PROYECTO.md docs/ 2>/dev/null || true
mv CONFIGURAR-CPANEL-SMTP.md docs/ 2>/dev/null || true
mv DOCKGE-*.md docs/ 2>/dev/null || true
mv PULL-MANUAL.md docs/ 2>/dev/null || true
mv WEBHOOK-SETUP.md docs/ 2>/dev/null || true
mv VERIFICACION-POST-BUILD.md docs/ 2>/dev/null || true
mv VERIFICAR-FIREBASE-RULES.md docs/ 2>/dev/null || true
mv VERIFICAR-PHP.md docs/ 2>/dev/null || true
mv SOLUCION-AUTENTICACION-SMTP.md docs/ 2>/dev/null || true
mv INSTALAR-PHPMailer.md docs/ 2>/dev/null || true
mv MODULO-MENSAJERIA.md docs/ 2>/dev/null || true

echo "✅ Documentación movida"
echo ""

# Mover uploads existentes a shared/
echo "📁 Moviendo uploads a shared/..."

if [ -d "uploads" ]; then
    cp -r uploads/* shared/uploads/ 2>/dev/null || true
    echo "✅ Uploads movidos a shared/"
fi

echo ""
echo "🎉 Estructura organizada exitosamente!"
echo ""
echo "📋 Estructura final:"
echo "  current/     - Sistema actual (React + Firebase)"
echo "  new/         - Sistema nuevo (Laravel + SQL)"
echo "  shared/      - Recursos compartidos"
echo "  scripts/     - Scripts de utilidad"
echo "  docs/        - Documentación"
echo ""

