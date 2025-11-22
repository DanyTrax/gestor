#!/bin/bash

# Script de despliegue para cPanel
# Uso: ./deploy.sh

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue..."

# 1. Navegar al directorio
cd ~/clients.dowgroupcol.com || { echo "❌ Error: No se pudo acceder al directorio"; exit 1; }

# 2. Hacer pull
echo "📥 Haciendo git pull..."
git pull origin main || { echo "❌ Error en git pull"; exit 1; }

# 3. Verificar que dist/ existe y tiene contenido
echo "🔍 Verificando dist/..."
if [ ! -d "dist" ]; then
    echo "❌ Error: La carpeta dist/ no existe"
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

# Verificar archivos JS específicos
JS_FILE=$(grep -o 'src="/assets/[^"]*\.js"' index.html | sed 's/src="\/assets\///; s/"//')
if [ -z "$JS_FILE" ]; then
    echo "⚠️  No se pudo extraer el nombre del archivo JS de index.html"
else
    echo "🔍 Buscando archivo JS: $JS_FILE"
    if [ -f "assets/$JS_FILE" ]; then
        echo "✅ Archivo JS encontrado: assets/$JS_FILE"
        ls -lh "assets/$JS_FILE"
    else
        echo "❌ Error: El archivo JS assets/$JS_FILE no existe"
        echo "📋 Archivos JS disponibles en assets/:"
        ls -1 assets/*.js 2>/dev/null || echo "   (ninguno)"
        exit 1
    fi
fi

# Verificar archivo CSS
CSS_FILE=$(grep -o 'href="/assets/[^"]*\.css"' index.html | sed 's/href="\/assets\///; s/"//')
if [ -z "$CSS_FILE" ]; then
    echo "⚠️  No se pudo extraer el nombre del archivo CSS de index.html"
else
    echo "🔍 Buscando archivo CSS: $CSS_FILE"
    if [ -f "assets/$CSS_FILE" ]; then
        echo "✅ Archivo CSS encontrado: assets/$CSS_FILE"
        ls -lh "assets/$CSS_FILE"
    else
        echo "❌ Error: El archivo CSS assets/$CSS_FILE no existe"
        echo "📋 Archivos CSS disponibles en assets/:"
        ls -1 assets/*.css 2>/dev/null || echo "   (ninguno)"
        exit 1
    fi
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
    # Verificar que excluye /assets/
    if grep -q "^/assets/" .htaccess || grep -q "assets" .htaccess; then
        echo "✅ .htaccess parece estar configurado correctamente"
    else
        echo "⚠️  .htaccess podría necesitar configuración para /assets/"
    fi
else
    echo "⚠️  .htaccess no encontrado (puede ser normal si no se necesita)"
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

