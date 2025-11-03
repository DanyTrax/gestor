# 🔧 Solución: Error 255 en package:discover

## ⚠️ Error

```
Script @php artisan package:discover --ansi handling the post-autoload-dump event returned with error code 255
```

## ✅ Solución

Este error **NO es crítico**. La instalación de dependencias se completó, solo falló un script post-install.

### Opción 1: Ignorar el error (Recomendado)

El error puede ignorarse. Las dependencias están instaladas. Continúa con:

```bash
cd ~/clients.dowgroupcol.com/new

# Generar APP_KEY
php artisan key:generate

# Ejecutar migraciones
php artisan migrate --force

# Crear tabla de sesiones
php artisan session:table
php artisan migrate --force
```

### Opción 2: Ejecutar manualmente después

```bash
php artisan package:discover
```

### Opción 3: Limpiar y recrear

```bash
php artisan config:clear
php artisan cache:clear
php artisan package:discover
```

## 📋 Verificar que todo funciona

```bash
# Verificar versión de Laravel
php artisan --version

# Debe mostrar: Laravel Framework 10.x.x

# Si funciona, las dependencias están bien instaladas
```

## 🎯 Importante

El error 255 en `package:discover` es común cuando:
- APP_KEY no está configurado aún
- Cache de configuración está corrupto
- Primera instalación

**No impide que Laravel funcione.** Solo significa que algunos paquetes no se descubrieron automáticamente, pero puedes ejecutarlo manualmente después.

## ✅ Checklist

Después de ver el error 255:

1. ✅ Verificar que `vendor/` existe:
   ```bash
   ls -la vendor/ | head -5
   ```

2. ✅ Generar APP_KEY:
   ```bash
   php artisan key:generate
   ```

3. ✅ Ejecutar migraciones:
   ```bash
   php artisan migrate --force
   ```

4. ✅ Probar Laravel:
   ```bash
   php artisan --version
   ```

Si todo esto funciona, el error 255 puede ignorarse.

