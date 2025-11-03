# 🔧 Instalar Dependencias con PHP 8.1

## ✅ Solución Aplicada

El `composer.json` ha sido actualizado para usar **Laravel 10** (compatible con PHP 8.1).

## 📋 Pasos en el Servidor

### 1. Actualizar el repositorio

```bash
cd ~/clients.dowgroupcol.com
git pull
```

### 2. Ir al directorio de Laravel

```bash
cd new
```

### 3. Eliminar composer.lock (si existe)

```bash
rm -f composer.lock
```

### 4. Instalar dependencias

```bash
composer install --no-dev --optimize-autoloader
```

Esto instalará:
- ✅ Laravel 10.x (compatible con PHP 8.1)
- ✅ Sanctum 3.x
- ✅ DomPDF 2.x
- ✅ Intervention Image 2.x

## ⏱️ Tiempo Estimado

La instalación puede tardar 3-5 minutos.

## ✅ Verificar Instalación

```bash
# Verificar versión de Laravel
php artisan --version

# Debe mostrar: Laravel Framework 10.x.x

# Verificar que vendor/ existe
ls -la vendor/ | head -5
```

## 🎯 Después de Instalar

1. Ejecutar migraciones:
   ```bash
   php artisan migrate --force
   ```

2. Crear tabla de sesiones:
   ```bash
   php artisan session:table
   php artisan migrate --force
   ```

3. Crear usuario:
   ```bash
   php create-user.php admin@tudominio.com TuContraseña123 Administrador
   ```

4. Probar login:
   ```
   https://clients.dowgroupcol.com/new/public/login
   ```

## 📝 Nota

Laravel 10 es una versión LTS (Long Term Support) y es perfectamente adecuada para producción. Todas las funcionalidades funcionan igual.

