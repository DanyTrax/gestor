#!/bin/bash

# Script para corregir index.html en el servidor
# Uso: bash fix-index-html.sh

set -e

echo "🔧 Corrigiendo index.html..."
echo ""

cd ~/clients.dowgroupcol.com || { echo "❌ Error: No se pudo acceder al directorio"; exit 1; }

# Verificar que index.html existe
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html no existe"
    exit 1
fi

# Buscar archivos JS disponibles
echo "📋 Buscando archivos JS disponibles en assets/..."
JS_FILES=$(ls -1 assets/index*.js 2>/dev/null | xargs -n1 basename)

if [ -z "$JS_FILES" ]; then
    echo "❌ Error: No se encontraron archivos JS en assets/"
    echo "📋 Archivos disponibles en assets/:"
    ls -1 assets/*.js 2>/dev/null || echo "   (ninguno)"
    exit 1
fi

# Obtener el primer archivo JS principal (index*.js)
MAIN_JS=$(ls -1 assets/index*.js 2>/dev/null | head -1 | xargs -n1 basename)

if [ -z "$MAIN_JS" ]; then
    echo "❌ Error: No se encontró archivo JS principal (index*.js)"
    exit 1
fi

echo "✅ Archivo JS principal encontrado: $MAIN_JS"

# Verificar qué referencia tiene actualmente index.html
CURRENT_REF=$(grep -oE 'src="/assets/[^"]+\.js"' index.html | sed 's|src="/assets/||; s|"||' | head -1)

echo "📄 Referencia actual en index.html: $CURRENT_REF"

if [ "$CURRENT_REF" = "$MAIN_JS" ]; then
    echo "✅ index.html ya tiene la referencia correcta"
    exit 0
fi

# Hacer backup de index.html
echo "💾 Haciendo backup de index.html..."
cp index.html index.html.backup.$(date +%Y%m%d_%H%M%S)

# Reemplazar la referencia en index.html
echo "🔧 Actualizando referencia en index.html..."
sed -i "s|src=\"/assets/[^\"]*\.js\"|src=\"/assets/$MAIN_JS\"|g" index.html

# Verificar que el cambio se aplicó
NEW_REF=$(grep -oE 'src="/assets/[^"]+\.js"' index.html | sed 's|src="/assets/||; s|"||' | head -1)

if [ "$NEW_REF" = "$MAIN_JS" ]; then
    echo "✅ index.html actualizado correctamente"
    echo "📄 Nueva referencia: $NEW_REF"
    
    # Verificar que el archivo existe
    if [ -f "assets/$MAIN_JS" ]; then
        echo "✅ El archivo JS existe: assets/$MAIN_JS"
        ls -lh "assets/$MAIN_JS"
    else
        echo "❌ ERROR: El archivo JS no existe: assets/$MAIN_JS"
        exit 1
    fi
else
    echo "❌ Error: No se pudo actualizar index.html"
    echo "📄 Referencia actual: $NEW_REF"
    echo "📄 Referencia esperada: $MAIN_JS"
    exit 1
fi

echo ""
echo "✅ Corrección completada!"
echo ""
echo "🌐 Próximos pasos:"
echo "   1. Limpia la caché del navegador (Ctrl + Shift + R)"
echo "   2. Recarga la página"
echo "   3. Verifica la consola del navegador (F12)"

