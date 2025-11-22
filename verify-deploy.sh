#!/bin/bash

# Script para verificar el despliegue
# Uso: bash verify-deploy.sh

echo "🔍 Verificando despliegue..."
echo ""

# Verificar que index.html existe
if [ -f "index.html" ]; then
    echo "✅ index.html existe"
    # Verificar qué archivo JS referencia
    JS_REF=$(grep -oE 'src="/assets/[^"]+\.js"' index.html | sed 's|src="/assets/||; s|"||')
    echo "📄 index.html referencia: $JS_REF"
    
    # Verificar si ese archivo existe
    if [ -f "assets/$JS_REF" ]; then
        echo "✅ El archivo JS referenciado existe: assets/$JS_REF"
        ls -lh "assets/$JS_REF"
    else
        echo "❌ El archivo JS referenciado NO existe: assets/$JS_REF"
        echo "📋 Archivos JS disponibles en assets/:"
        ls -1 assets/*.js 2>/dev/null || echo "   (ninguno)"
    fi
else
    echo "❌ index.html NO existe"
fi

echo ""

# Verificar .htaccess
if [ -f ".htaccess" ]; then
    echo "✅ .htaccess existe"
    if grep -q "^RewriteCond %{REQUEST_URI} ^/assets/" .htaccess; then
        echo "✅ .htaccess tiene regla para /assets/"
    else
        echo "⚠️  .htaccess podría no tener regla para /assets/"
    fi
else
    echo "❌ .htaccess NO existe"
fi

echo ""

# Verificar archivos en assets/
if [ -d "assets" ]; then
    echo "✅ Directorio assets/ existe"
    FILE_COUNT=$(find assets -type f | wc -l)
    echo "📊 Total de archivos en assets/: $FILE_COUNT"
    echo "📋 Archivos JS en assets/:"
    ls -1 assets/*.js 2>/dev/null || echo "   (ninguno)"
    echo "📋 Archivos CSS en assets/:"
    ls -1 assets/*.css 2>/dev/null || echo "   (ninguno)"
else
    echo "❌ Directorio assets/ NO existe"
fi

echo ""
echo "✅ Verificación completada"

