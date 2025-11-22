#!/bin/bash

# Script de despliegue para el SERVIDOR
# NO compila, solo copia los archivos desde dist/
# La compilación debe hacerse LOCALMENTE antes de hacer push

set -e

echo "🚀 Iniciando despliegue en servidor..."
echo ""

cd ~/clients.dowgroupcol.com || { echo "❌ Error: No se pudo acceder al directorio"; exit 1; }

# 1. Verificar si hay cambios locales y manejarlos
echo "🔍 Verificando cambios locales..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  Se detectaron cambios locales. Guardándolos en stash..."
    git stash push -m "Cambios locales antes de pull - $(date +%Y%m%d_%H%M%S)" || true
    echo "✅ Cambios guardados en stash"
fi

# 2. Hacer pull para obtener los archivos compilados
echo "📥 Haciendo git pull..."
git pull origin main || { echo "❌ Error en git pull"; exit 1; }

# 3. Verificar que dist/ existe y tiene contenido
echo "🔍 Verificando dist/..."
if [ ! -d "dist" ]; then
    echo "❌ Error: La carpeta dist/ no existe"
    echo "⚠️  Asegúrate de que dist/ esté en el repositorio (compilado localmente)"
    exit 1
fi

if [ ! -d "dist/assets" ]; then
    echo "❌ Error: La carpeta dist/assets/ no existe"
    exit 1
fi

# Contar archivos en dist/assets/
FILE_COUNT=$(find dist/assets -type f | wc -l)
echo "✅ Encontrados $FILE_COUNT archivos en dist/assets/"

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "❌ Error: dist/assets/ está vacío"
    echo "⚠️  Asegúrate de compilar localmente antes de hacer push"
    exit 1
fi

# 4. Hacer backup de archivos actuales (opcional)
echo "💾 Haciendo backup de archivos actuales..."
if [ -d "assets" ]; then
    mv assets assets.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi
if [ -f "index.html" ]; then
    cp index.html index.html.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

# 5. Copiar archivos desde dist/
echo "📋 Copiando archivos desde dist/..."
cp -r dist/* . || { echo "❌ Error al copiar archivos"; exit 1; }

# 6. Verificar que los archivos se copiaron
echo "🔍 Verificando archivos copiados..."
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html no se copió"
    exit 1
fi

if [ ! -d "assets" ]; then
    echo "❌ Error: assets/ no se copió"
    exit 1
fi

# Verificar archivos JS principales
JS_FILES=$(ls -1 assets/index*.js 2>/dev/null | wc -l)
if [ "$JS_FILES" -eq 0 ]; then
    echo "⚠️  No se encontraron archivos JS principales en assets/"
    echo "📋 Archivos disponibles en assets/:"
    ls -1 assets/*.js 2>/dev/null || echo "   (ninguno)"
else
    echo "✅ Encontrados $JS_FILES archivo(s) JS principal(es)"
fi

# Verificar archivo CSS
CSS_FILES=$(ls -1 assets/index*.css 2>/dev/null | wc -l)
if [ "$CSS_FILES" -eq 0 ]; then
    echo "⚠️  No se encontró archivo CSS principal en assets/"
else
    echo "✅ Encontrado archivo CSS principal"
fi

# 7. Configurar permisos
echo "🔐 Configurando permisos..."
chmod 644 index.html
chmod 644 .htaccess 2>/dev/null || true
chmod -R 755 assets/
find assets/ -type f -exec chmod 644 {} \;

# 8. Verificar .htaccess
if [ -f ".htaccess" ]; then
    echo "✅ .htaccess encontrado"
else
    echo "⚠️  .htaccess no encontrado"
fi

# 9. Resumen
echo ""
echo "✅ Despliegue completado exitosamente!"
echo ""
echo "📋 Resumen:"
echo "   - index.html: $(ls -lh index.html | awk '{print $5}')"
echo "   - Archivos en assets/: $(find assets -type f | wc -l)"
echo "   - Tamaño total assets/: $(du -sh assets/ | awk '{print $1}')"
echo ""
echo "🌐 Próximos pasos:"
echo "   1. Limpia la caché del navegador (Ctrl + Shift + R)"
echo "   2. Recarga la página"
echo "   3. Verifica la consola del navegador (F12)"

