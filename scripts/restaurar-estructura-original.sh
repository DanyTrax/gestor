#!/bin/bash

# Script para restaurar la estructura original del proyecto
# Mueve React + Firebase de current/ a la raíz y elimina Laravel

echo "🔄 Restaurando estructura original..."
echo "======================================"

# Verificar que estamos en la raíz del proyecto
if [ ! -d "current" ]; then
    echo "❌ Error: No se encuentra el directorio 'current/'"
    echo "   Asegúrate de estar en la raíz del proyecto"
    exit 1
fi

echo ""
echo "📦 Moviendo archivos de current/ a la raíz..."

# Mover archivos React a la raíz
cd current

# Archivos React principales
mv src ../ 2>/dev/null && echo "✅ src/ movido" || echo "⚠️  src/ ya existe en raíz"
mv dist ../ 2>/dev/null && echo "✅ dist/ movido" || echo "⚠️  dist/ ya existe en raíz"
mv package.json ../ 2>/dev/null && echo "✅ package.json movido" || echo "⚠️  package.json ya existe en raíz"
mv package-lock.json ../ 2>/dev/null && echo "✅ package-lock.json movido" || echo "⚠️  package-lock.json ya existe en raíz"
mv node_modules ../ 2>/dev/null && echo "✅ node_modules/ movido" || echo "⚠️  node_modules/ ya existe en raíz"

# Archivos de configuración
mv vite.config.js ../ 2>/dev/null && echo "✅ vite.config.js movido" || echo "⚠️  vite.config.js ya existe en raíz"
mv tailwind.config.js ../ 2>/dev/null && echo "✅ tailwind.config.js movido" || echo "⚠️  tailwind.config.js ya existe en raíz"
mv postcss.config.js ../ 2>/dev/null && echo "✅ postcss.config.js movido" || echo "⚠️  postcss.config.js ya existe en raíz"
mv index.html ../ 2>/dev/null && echo "✅ index.html movido" || echo "⚠️  index.html ya existe en raíz"
mv .eslintrc.cjs ../ 2>/dev/null && echo "✅ .eslintrc.cjs movido" || echo "⚠️  .eslintrc.cjs ya existe en raíz"

# Archivos PHP
mv send-email.php ../ 2>/dev/null && echo "✅ send-email.php movido" || echo "⚠️  send-email.php ya existe en raíz"
mv upload.php ../ 2>/dev/null && echo "✅ upload.php movido" || echo "⚠️  upload.php ya existe en raíz"

# Directorio uploads
if [ -d "uploads" ]; then
    if [ -d "../uploads" ]; then
        echo "⚠️  uploads/ ya existe en raíz, copiando contenido..."
        cp -r uploads/* ../uploads/ 2>/dev/null || true
    else
        mv uploads ../ 2>/dev/null && echo "✅ uploads/ movido" || echo "⚠️  Error al mover uploads/"
    fi
fi

# Firebase
mv firebase.json ../ 2>/dev/null && echo "✅ firebase.json movido" || echo "⚠️  firebase.json ya existe en raíz"
mv firebase-rules.txt ../ 2>/dev/null && echo "✅ firebase-rules.txt movido" || echo "⚠️  firebase-rules.txt ya existe en raíz"
mv firebase-rules-simple.txt ../ 2>/dev/null && echo "✅ firebase-rules-simple.txt movido" || echo "⚠️  firebase-rules-simple.txt ya existe en raíz"
mv functions ../ 2>/dev/null && echo "✅ functions/ movido" || echo "⚠️  functions/ ya existe en raíz"

# Docker
mv Dockerfile ../ 2>/dev/null && echo "✅ Dockerfile movido" || echo "⚠️  Dockerfile ya existe en raíz"
mv docker-compose.yml ../ 2>/dev/null && echo "✅ docker-compose.yml movido" || echo "⚠️  docker-compose.yml ya existe en raíz"
mv docker-compose-git.yml ../ 2>/dev/null && echo "✅ docker-compose-git.yml movido" || echo "⚠️  docker-compose-git.yml ya existe en raíz"
mv .dockerignore ../ 2>/dev/null && echo "✅ .dockerignore movido" || echo "⚠️  .dockerignore ya existe en raíz"

# .htaccess
mv .htaccess ../ 2>/dev/null && echo "✅ .htaccess movido" || echo "⚠️  .htaccess ya existe en raíz"

cd ..

echo ""
echo "🗑️  Eliminando directorios de migración..."

# Eliminar directorio current si está vacío
if [ -d "current" ]; then
    if [ -z "$(ls -A current)" ]; then
        rmdir current && echo "✅ Directorio current/ eliminado (estaba vacío)"
    else
        echo "⚠️  Directorio current/ no está vacío, revisar manualmente"
        ls -la current/
    fi
fi

# Eliminar directorio new/ (Laravel)
if [ -d "new" ]; then
    echo "⚠️  ¿Eliminar directorio new/ (Laravel)? [s/N]"
    read -r response
    if [[ "$response" =~ ^[sS]$ ]]; then
        rm -rf new && echo "✅ Directorio new/ eliminado"
    else
        echo "⚠️  Directorio new/ conservado"
    fi
fi

echo ""
echo "✅ Estructura restaurada"
echo ""
echo "📋 Archivos en la raíz:"
ls -la | grep -E "^d|^-" | grep -v "^\.git" | head -20

echo ""
echo "🎯 Próximos pasos:"
echo "1. Verificar que todo funciona: npm run build"
echo "2. Verificar que la URL apunta correctamente"
echo "3. Probar la aplicación"

