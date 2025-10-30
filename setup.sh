#!/bin/bash

echo "🚀 Configurando Gestor de Cobros..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio correcto."
    exit 1
fi

# Limpiar instalaciones anteriores
echo "🧹 Limpiando instalaciones anteriores..."
rm -rf node_modules
rm -rf package-lock.json

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar que Tailwind esté funcionando
echo "🎨 Verificando configuración de Tailwind..."
if [ -f "tailwind.config.js" ] && [ -f "postcss.config.js" ]; then
    echo "✅ Configuración de Tailwind encontrada"
else
    echo "❌ Error en configuración de Tailwind"
    exit 1
fi

echo "✅ ¡Configuración completada!"
echo "🚀 Para ejecutar el proyecto: npm run dev"






