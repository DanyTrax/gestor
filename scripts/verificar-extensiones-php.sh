#!/bin/bash

# Script para verificar extensiones PHP necesarias para Laravel

echo "🔍 Verificando extensiones PHP necesarias para Laravel..."
echo ""

PHP_VERSION=$(php -v | head -1 | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "Versión PHP: $PHP_VERSION"
echo ""

REQUIRED_EXTENSIONS=(
    "openssl"
    "pdo"
    "pdo_mysql"
    "mbstring"
    "tokenizer"
    "xml"
    "ctype"
    "json"
    "fileinfo"
    "curl"
    "zip"
)

MISSING=()

echo "Extensiones requeridas:"
echo "======================"
for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if php -m | grep -qi "^${ext}$"; then
        echo "✅ $ext - Instalado"
    else
        echo "❌ $ext - FALTANTE"
        MISSING+=("$ext")
    fi
done

echo ""
echo "======================"

if [ ${#MISSING[@]} -eq 0 ]; then
    echo "✅ Todas las extensiones están instaladas"
    exit 0
else
    echo "❌ Extensiones faltantes: ${MISSING[*]}"
    echo ""
    echo "Para habilitarlas en cPanel:"
    echo "1. Ir a 'Select PHP Version'"
    echo "2. Hacer clic en 'Extensions'"
    echo "3. Activar las extensiones faltantes"
    echo "4. Guardar"
    exit 1
fi

