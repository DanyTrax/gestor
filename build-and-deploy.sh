#!/bin/bash

# Script para compilar y preparar para despliegue
# Uso: bash build-and-deploy.sh [mensaje de commit]

set -e

COMMIT_MSG=${1:-"build: Compilar y actualizar dist/"}

echo "🔨 Compilando proyecto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación"
    exit 1
fi

echo "✅ Compilación exitosa"
echo ""

echo "📦 Agregando dist/ al repositorio (forzado)..."
git add -f dist/

echo "📋 Estado del repositorio:"
git status --short

echo ""
read -p "¿Hacer commit y push? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    git commit -m "$COMMIT_MSG"
    git push
    echo ""
    echo "✅ Cambios subidos al repositorio"
    echo ""
    echo "💡 Próximos pasos en el servidor:"
    echo "   cd ~/clients.dowgroupcol.com"
    echo "   git pull"
    echo "   bash fix-deploy.sh"
else
    echo "✅ Listo para commit manual:"
    echo "   git commit -m \"$COMMIT_MSG\""
    echo "   git push"
fi

