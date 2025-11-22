#!/bin/bash

# Script para corregir problemas de despliegue
# Uso: bash fix-deploy.sh

set -e

echo "🔧 Corrigiendo despliegue..."
echo ""

cd ~/clients.dowgroupcol.com || { echo "❌ Error: No se pudo acceder al directorio"; exit 1; }

# 1. Verificar que dist/ existe
if [ ! -d "dist" ]; then
    echo "❌ Error: La carpeta dist/ no existe. Haz git pull primero."
    exit 1
fi

# 2. Eliminar archivos antiguos
echo "🗑️  Eliminando archivos antiguos..."
rm -rf assets/
rm -f index.html

# 3. Copiar archivos nuevos desde dist/
echo "📋 Copiando archivos desde dist/..."
cp -r dist/* .

# 4. Verificar que index.html existe y tiene la referencia correcta
if [ -f "index.html" ]; then
    echo "✅ index.html copiado"
    JS_REF=$(grep -oE 'src="/assets/[^"]+\.js"' index.html | sed 's|src="/assets/||; s|"||' | head -1)
    echo "📄 index.html referencia: $JS_REF"
    
    if [ -f "assets/$JS_REF" ]; then
        echo "✅ El archivo JS referenciado existe: assets/$JS_REF"
    else
        echo "❌ ERROR: El archivo JS referenciado NO existe: assets/$JS_REF"
        echo "📋 Archivos JS disponibles en assets/:"
        ls -1 assets/*.js 2>/dev/null || echo "   (ninguno)"
        exit 1
    fi
else
    echo "❌ Error: index.html no se copió"
    exit 1
fi

# 5. Configurar permisos
echo "🔐 Configurando permisos..."
chmod 644 index.html
chmod 644 .htaccess 2>/dev/null || true
chmod -R 755 assets/
find assets/ -type f -exec chmod 644 {} \;

# 6. Verificar .htaccess
if [ -f ".htaccess" ]; then
    echo "✅ .htaccess existe"
    if grep -q "^RewriteCond %{REQUEST_URI} ^/assets/" .htaccess; then
        echo "✅ .htaccess tiene regla para /assets/"
    else
        echo "⚠️  .htaccess podría no tener regla para /assets/"
    fi
else
    echo "⚠️  .htaccess no existe"
fi

echo ""
echo "✅ Corrección completada!"
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

