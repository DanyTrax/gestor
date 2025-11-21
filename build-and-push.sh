#!/bin/bash

# Script para hacer build y subir al repositorio
# Uso: ./build-and-push.sh [mensaje-commit]

echo "🔨 Iniciando proceso de build y push..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json${NC}"
    echo "Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi

# 2. Instalar dependencias si node_modules no existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error al instalar dependencias${NC}"
        exit 1
    fi
fi

# 3. Hacer build
echo -e "${YELLOW}🔨 Compilando proyecto...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al compilar el proyecto${NC}"
    exit 1
fi

# 4. Verificar que dist/ se creó
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: No se creó el directorio dist/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completado exitosamente${NC}"

# 5. Agregar dist/ al staging (forzar aunque esté en .gitignore)
echo -e "${YELLOW}📝 Agregando dist/ al repositorio...${NC}"
git add -f dist/

# 6. Agregar otros archivos modificados
git add .

# 7. Verificar si hay cambios
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No hay cambios para commitear${NC}"
    exit 0
fi

# 8. Crear commit
COMMIT_MSG=${1:-"build: Actualizar build de producción"}
echo -e "${YELLOW}💾 Creando commit: ${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al crear commit${NC}"
    exit 1
fi

# 9. Push al repositorio
echo -e "${YELLOW}🚀 Subiendo cambios al repositorio...${NC}"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer push${NC}"
    echo "Intenta manualmente: git push origin main"
    exit 1
fi

echo -e "${GREEN}✅ ¡Proceso completado exitosamente!${NC}"
echo -e "${GREEN}📦 Build subido al repositorio${NC}"
echo ""
echo "En el servidor (cPanel), ejecuta:"
echo "  git pull origin main"
echo "  # Los archivos de dist/ estarán listos para usar"

