#!/bin/bash

# Script para compilar LOCALMENTE y preparar para despliegue
# Uso: bash build-and-deploy.sh [mensaje de commit]
# IMPORTANTE: Este script debe ejecutarse LOCALMENTE, no en el servidor

set -e

COMMIT_MSG=${1:-"build: Compilar y actualizar dist/"}

echo "🔨 Compilando proyecto localmente..."
echo "⚠️  IMPORTANTE: Este script debe ejecutarse en tu máquina local, NO en el servidor"
echo ""

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
    echo "💡 Próximos pasos en el SERVIDOR:"
    echo "   cd ~/clients.dowgroupcol.com"
    echo "   git pull"
    echo "   bash deploy-server.sh"
    echo ""
    echo "⚠️  NOTA: NO ejecutes 'npm run build' en el servidor"
    echo "   La compilación debe hacerse localmente y subirse al repositorio"
else
    echo "✅ Listo para commit manual:"
    echo "   git commit -m \"$COMMIT_MSG\""
    echo "   git push"
fi

