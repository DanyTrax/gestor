# 🔧 Solución: Error 255 en Composer Post-Install

## ❌ Error Reportado

```
Script @php artisan vendor:publish --tag=laravel-assets --ansi --force handling the post-update-cmd event returned with error code 255
```

## ✅ Solución

**Las dependencias SÍ se instalaron correctamente.** El error es solo en el script post-install que intenta publicar assets de Laravel antes de que esté configurado.

### Opción 1: Continuar (Recomendado)

El error no afecta la instalación. Simplemente continúa con los siguientes pasos:

```bash
cd ~/clients.dowgroupcol.com/new

# 1. Verificar que vendor/ existe
ls -la vendor/ | head -5

# 2. Verificar .env
cat .env | head -10

# Si no existe .env, crearlo:
cp .env.example .env

# 3. Generar APP_KEY
php artisan key:generate

# 4. Publicar assets manualmente (lo que falló en el script)
php artisan vendor:publish --tag=laravel-assets --force

# 5. Continuar con migraciones
php artisan migrate --force
```

### Opción 2: Re-ejecutar Composer (Opcional)

Si quieres que el script se ejecute correctamente después de configurar Laravel:

```bash
cd ~/clients.dowgroupcol.com/new

# Configurar primero
cp .env.example .env
php artisan key:generate

# Re-ejecutar el script post-install
composer run-script post-update-cmd
```

## 📝 Nota

Este error es común cuando:
- Laravel no está configurado (falta `.env` o `APP_KEY`)
- Las dependencias se instalaron pero Laravel aún no está inicializado

**No afecta la funcionalidad de la aplicación.** Solo significa que el script automático no pudo publicar los assets de Laravel, pero puedes hacerlo manualmente.

## ✅ Verificación

Después de ejecutar los pasos, verifica:

```bash
# Verificar instalación
php artisan --version

# Verificar configuración
php artisan config:show | grep app.name
```

## 🎯 Siguiente Paso

Continuar con la configuración completa según `PASOS-FINALES-LARAVEL.md`.

