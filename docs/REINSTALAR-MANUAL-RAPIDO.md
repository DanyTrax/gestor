# ⚡ Reinstalar Laravel Manualmente (Rápido)

## 🚀 Opción 1: Hacer Pull y Usar el Script

```bash
cd ~/clients.dowgroupcol.com/new

# 1. Actualizar repositorio
git pull origin main

# 2. Verificar que el script existe
ls -la scripts/reinstalar-laravel-completo.sh

# 3. Ejecutar
chmod +x scripts/reinstalar-laravel-completo.sh
bash scripts/reinstalar-laravel-completo.sh
```

## ⚡ Opción 2: Reinstalación Manual Directa (SIN Script)

Si el script no está disponible, ejecuta estos comandos directamente:

```bash
cd ~/clients.dowgroupcol.com/new

echo "🔄 Iniciando reinstalación..."

# 1. Backup de .env
echo "📦 Creando backup..."
cp .env ../.env.backup-$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "⚠️  .env no existe (normal si primera vez)"

# 2. Limpiar instalación anterior
echo "🧹 Limpiando instalación anterior..."
rm -rf vendor
rm -f composer.lock
echo "✅ Limpiado"

# 3. Reinstalar dependencias
echo "📥 Reinstalando dependencias (esto puede tardar 3-5 minutos)..."
composer install --no-dev --optimize-autoloader

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# 4. Verificar instalación
echo "🔍 Verificando instalación..."
if [ -d "vendor" ] && [ -f "vendor/autoload.php" ]; then
    echo "✅ vendor/ existe y tiene autoload.php"
else
    echo "❌ Problema con vendor/"
    exit 1
fi

# 5. Verificar sintaxis
echo "🔍 Verificando sintaxis..."
php -l bootstrap/app.php 2>/dev/null && echo "✅ bootstrap/app.php OK" || echo "⚠️  bootstrap/app.php tiene problemas"

# 6. Probar Laravel
echo "🧪 Probando Laravel..."
php artisan --version && echo "✅ Laravel funciona!" || echo "⚠️  Laravel tiene problemas"

echo ""
echo "✅ REINSTALACIÓN COMPLETA"
echo ""
echo "📋 Próximos pasos:"
echo "1. php artisan key:generate"
echo "2. php artisan migrate --force"
echo "3. php artisan config:cache"
```

